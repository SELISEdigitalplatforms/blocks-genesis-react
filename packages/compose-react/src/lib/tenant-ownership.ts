/**
 * Cross-tab ownership of the impersonation cookie.
 *
 * The access token lives in a cookie named after the application domain alone -- no tenant, no
 * project, no per-tab discriminator -- so every tab on the origin shares exactly one token. The tab
 * that impersonated most recently owns it; every other tab is pointed somewhere it does not know
 * about.
 *
 * Nothing in the browser can detect that from inside a tab. The cookie is `HttpOnly`, so neither
 * `document.cookie` nor CookieStore change events can see it, and the only server-side signal --
 * the impersonation status endpoint -- is refetched on window focus. A tab that is *visible but not
 * focused* (a second monitor) therefore keeps polling happily under another project's token, with
 * its own store and its own route agreeing with each other and both being stale.
 *
 * Comparing two client-side values cannot catch that: the staleness is in both of them. The signal
 * has to come from outside the tab. This module is that signal.
 *
 * `BroadcastChannel` is scoped to the origin, which is precisely the set of tabs that share the
 * cookie -- coordination reach and conflict reach are the same set, so nothing is over- or
 * under-notified. Where it is unavailable we fall back to a `localStorage` write, whose `storage`
 * event fires in every *other* tab of the origin and gives the same reach.
 */

const CHANNEL_NAME = "blocks:tenant";
const STORAGE_KEY = "blocks:tenant-owner";

export interface TenantClaim {
  /** The tenant the claiming tab impersonated. */
  tenantId: string;
  /** Identifies the claiming tab so it can ignore its own message. */
  tabId: string;
  ts: number;
}

/**
 * Asks the other tabs whether any of them is still working inside `probedTenantId`.
 *
 * The field names deliberately share nothing with `TenantClaim`: a tab still running an older build
 * validates messages by `tenantId` and `tabId`, and must never mistake a question for a claim.
 */
interface OwnerProbe {
  kind: "owner-probe";
  probeId: string;
  probedTenantId: string;
}

/** The answer to an `OwnerProbe`, sent only by a tab that holds the probed tenant right now. */
interface OwnerPresent {
  kind: "owner-present";
  probeId: string;
}

/**
 * How long a probe waits for a live holder to answer before the claim is judged abandoned. A live
 * tab answers in milliseconds -- BroadcastChannel messages are not subject to background-timer
 * throttling -- so this bounds only the wait for a holder that is not there.
 */
export const OWNER_PROBE_TIMEOUT_MS = 300;

const randomId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

/**
 * Stable for the lifetime of this document -- and only that. A reload is a new document with a new
 * id, while the stored claim survives it; that is why a stored claim from another id is never
 * trusted on its own (see `isTenantHeldElsewhere`).
 */
export const TAB_ID: string = randomId();

const isBrowser = () => typeof window !== "undefined";

const hasBroadcastChannel = () =>
  isBrowser() && typeof BroadcastChannel !== "undefined";

let channel: BroadcastChannel | null = null;

const getChannel = (): BroadcastChannel | null => {
  if (!hasBroadcastChannel()) return null;
  if (!channel) channel = new BroadcastChannel(CHANNEL_NAME);
  return channel;
};

const isTenantClaim = (value: unknown): value is TenantClaim =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as TenantClaim).tenantId === "string" &&
  typeof (value as TenantClaim).tabId === "string";

const isOwnerProbe = (value: unknown): value is OwnerProbe =>
  typeof value === "object" &&
  value !== null &&
  (value as OwnerProbe).kind === "owner-probe" &&
  typeof (value as OwnerProbe).probeId === "string" &&
  typeof (value as OwnerProbe).probedTenantId === "string";

const isOwnerPresent = (value: unknown): value is OwnerPresent =>
  typeof value === "object" &&
  value !== null &&
  (value as OwnerPresent).kind === "owner-present" &&
  typeof (value as OwnerPresent).probeId === "string";

/** The tenant this tab is working inside right now, as declared by the route guard. */
let heldTenantId: string | null = null;
let responderInstalled = false;

const installProbeResponder = () => {
  if (responderInstalled) return;
  const bc = getChannel();
  if (!bc) return;
  responderInstalled = true;
  bc.addEventListener("message", (event: MessageEvent) => {
    const probe: unknown = event.data;
    if (!isOwnerProbe(probe)) return;
    if (!heldTenantId || probe.probedTenantId !== heldTenantId) return;
    const answer: OwnerPresent = {
      kind: "owner-present",
      probeId: probe.probeId,
    };
    bc.postMessage(answer);
  });
};

/**
 * Declare that this tab is working inside `tenantId`, so it answers probes for it. Returns a
 * release function.
 *
 * Held only by a window actually rendering a project's data, never by the console: a console tab
 * has nothing a newly opened project would break, so it must not make that project start detached.
 * The release only clears a hold it still owns, so a later hold is never undone by an earlier one's
 * cleanup.
 */
export const holdTenant = (tenantId: string): (() => void) => {
  if (!isBrowser() || !tenantId) return () => undefined;
  heldTenantId = tenantId;
  installProbeResponder();
  return () => {
    if (heldTenantId === tenantId) heldTenantId = null;
  };
};

/**
 * Whether some *other* live tab is working inside `tenantId` right now.
 *
 * The stored claim cannot answer this by itself. It outlives the tab that wrote it -- a reload
 * gives the same tab a new `TAB_ID`, and a closed tab never withdraws its claim -- so read alone it
 * made a window detach on a notice its own earlier page load had left, or one from a window that no
 * longer existed. Only a live holder answers, and `BroadcastChannel` never delivers a message back
 * to the object that posted it, so this tab cannot answer its own probe.
 *
 * Without `BroadcastChannel` there is no one to ask, and an unknown owner is treated as no owner:
 * the claim subscription still detaches the tab the moment a live window actually takes the cookie.
 */
export const isTenantHeldElsewhere = (
  tenantId: string,
  timeoutMs: number = OWNER_PROBE_TIMEOUT_MS,
): Promise<boolean> => {
  const bc = getChannel();
  if (!bc || !tenantId) return Promise.resolve(false);

  const probe: OwnerProbe = {
    kind: "owner-probe",
    probeId: randomId(),
    probedTenantId: tenantId,
  };

  return new Promise((resolve) => {
    const finish = (held: boolean) => {
      clearTimeout(timer);
      bc.removeEventListener("message", onMessage);
      resolve(held);
    };
    const onMessage = (event: MessageEvent) => {
      const answer: unknown = event.data;
      if (isOwnerPresent(answer) && answer.probeId === probe.probeId) {
        finish(true);
      }
    };
    const timer = setTimeout(() => finish(false), timeoutMs);
    bc.addEventListener("message", onMessage);
    bc.postMessage(probe);
  });
};

/** Whether two reads of the stored claim describe the same claim, rather than one replacing it. */
export const isSameClaim = (
  a: TenantClaim | null,
  b: TenantClaim | null,
): boolean =>
  !!a &&
  !!b &&
  a.tabId === b.tabId &&
  a.tenantId === b.tenantId &&
  a.ts === b.ts;

/**
 * Announce that this tab has taken the cookie for `tenantId`.
 *
 * Called after a *successful* impersonation only. Announcing an attempt would detach other tabs on
 * the strength of a call that may still fail, leaving every tab detached and none of them owning
 * anything.
 */
export const claimTenant = (tenantId: string): void => {
  if (!isBrowser() || !tenantId) return;

  const claim: TenantClaim = { tenantId, tabId: TAB_ID, ts: Date.now() };

  // Written whether or not BroadcastChannel exists: this is also how a newly opened tab discovers
  // the current owner before it issues its first request (see `readCurrentOwner`).
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(claim));
  } catch {
    // Private mode or a storage quota error. The channel below still reaches live tabs; only
    // cold-start discovery is lost, and the guard treats an unknown owner as "not detached".
  }

  getChannel()?.postMessage(claim);
};

/**
 * Forget every claim, for a logout. The next user signs in to a root-scoped cookie, and a claim
 * left by the previous one names a tenant that session has nothing to do with.
 */
export const clearTenantClaims = (): void => {
  heldTenantId = null;
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable: there was nothing stored to clear.
  }
};

/**
 * The last claim made by any tab on this origin, or null if none is recorded.
 *
 * Used on mount so a tab opened while another already owns the cookie starts in the correct state
 * rather than waiting for the next claim that may never come. A claim from another `tabId` is only
 * a lead: confirm it with `isTenantHeldElsewhere` before acting on it.
 */
export const readCurrentOwner = (): TenantClaim | null => {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isTenantClaim(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

/**
 * Subscribe to claims made by other tabs. Returns an unsubscribe function.
 *
 * This tab's own claims are filtered out, so a handler only ever sees a tenant change it did not
 * cause.
 */
export const subscribeToTenantClaims = (
  onClaim: (claim: TenantClaim) => void,
): (() => void) => {
  if (!isBrowser()) return () => undefined;

  const handleClaim = (claim: unknown) => {
    if (!isTenantClaim(claim)) return;
    if (claim.tabId === TAB_ID) return;
    onClaim(claim);
  };

  const bc = getChannel();
  if (bc) {
    const listener = (event: MessageEvent) => handleClaim(event.data);
    bc.addEventListener("message", listener);
    return () => bc.removeEventListener("message", listener);
  }

  // Fallback: `storage` fires only in the tabs that did not write, which is the filtering we want
  // anyway. The tabId check stays as a second line of defence.
  const listener = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    try {
      handleClaim(JSON.parse(event.newValue));
    } catch {
      // A malformed entry tells us nothing; leaving the tab attached is the safe default because
      // the route guard still compares the tenant on every render.
    }
  };
  window.addEventListener("storage", listener);
  return () => window.removeEventListener("storage", listener);
};
