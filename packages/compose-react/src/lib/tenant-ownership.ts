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

/** Stable for the lifetime of this document, which is exactly the lifetime of the cookie's owner. */
export const TAB_ID: string = (() => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
})();

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
 * The last claim made by any tab on this origin, or null if none is recorded.
 *
 * Used on mount so a tab opened while another already owns the cookie starts in the correct state
 * rather than waiting for the next claim that may never come.
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
