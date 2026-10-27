/**
 * One lock per shared session cookie, held across every tab of the application.
 *
 * Refreshing the token, opening a project and leaving it each replace the refresh token in the
 * shared cookie. Run side by side -- two tabs, or a refresh still in flight when the user opens a
 * project -- the browser keeps whichever response lands last, so a page that has just confirmed one
 * tenant can be left holding another tenant's cookie. The Web Locks API is scoped to the origin,
 * which is exactly the set of tabs that share the cookie, so holding it makes those writes take
 * turns.
 *
 * Where the API is missing, calls inside this tab still take turns; other tabs are not covered,
 * which is how every tab behaved before the lock existed.
 *
 * The lock is not re-entrant. Code running inside it must not call anything that takes it again --
 * in particular, its requests must skip the client's own 401 → refresh path (see
 * `HttpClient.refreshWithinSessionLock`).
 */

const LOCK_PREFIX = "blocks-session:";

/**
 * How long to wait for another holder before going ahead without the lock. Every call made while
 * holding it is bounded below this, so only a tab that froze mid-call is waited out.
 */
export const SESSION_LOCK_WAIT_MS = 25_000;

const localTails = new Map<string, Promise<unknown>>();

const runLocally = <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  const previous = localTails.get(name) ?? Promise.resolve();
  const run = previous.then(fn, fn);
  const tail = run.catch(() => undefined);
  localTails.set(name, tail);
  void tail.then(() => {
    if (localTails.get(name) === tail) localTails.delete(name);
  });
  return run;
};

/** An AbortSignal that fires after `ms`, on runtimes with or without `AbortSignal.timeout`. */
export const timeoutSignal = (ms: number): AbortSignal => {
  if (typeof AbortSignal !== "undefined" && "timeout" in AbortSignal) {
    return AbortSignal.timeout(ms);
  }
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
};

/** Runs `fn` while holding the session lock called `name`, and returns what it returns. */
export const withSessionLock = async <T>(
  name: string,
  fn: () => Promise<T>,
): Promise<T> => {
  const locks = typeof navigator !== "undefined" ? navigator.locks : undefined;
  if (!locks?.request) return runLocally(name, fn);

  const waitLimit = timeoutSignal(SESSION_LOCK_WAIT_MS);
  let acquired = false;
  try {
    return await locks.request(
      `${LOCK_PREFIX}${name}`,
      { signal: waitLimit },
      () => {
        acquired = true;
        return fn();
      },
    );
  } catch (error) {
    // The browser rejects a timed-out wait with the signal's reason, a TimeoutError, so the wait
    // limit itself tells whether that is what happened.
    if (acquired || !waitLimit.aborted) throw error;
    // Another tab has held the lock far longer than any call it makes should take. Going ahead
    // risks the overlap the lock exists to prevent; failing would block the user's action on a
    // tab that may never let go.
    console.error(
      `Session lock "${name}" was not released in time; continuing without it.`,
    );
    return fn();
  }
};
