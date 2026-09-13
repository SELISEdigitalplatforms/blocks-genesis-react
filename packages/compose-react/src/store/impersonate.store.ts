import { create } from "zustand";

/** Why a window is no longer the one holding the shared session. */
export type DetachedReason = "another-project" | "console";

interface ImpersonateStoreState {
  isImpersonated: boolean;
  impersonatedTenantId: string | null;
  originalTenantId: string | null;
  isInitialized: boolean;
  /**
   * A re-impersonation that failed. Kept in the store rather than swallowed so the guard can render
   * a terminal state with a way out: a failure used to leave the store pinned to the *previous*
   * project's tenant, which froze the guard's effect dependencies and meant it never retried.
   */
  impersonationError: unknown;
  /**
   * Why this window lost the shared session, or null while it still holds it. A detached window
   * must issue no requests: its own state is stale, and the cookie underneath it now belongs to
   * somewhere else.
   *
   * The cause is kept, not just the fact, because the two read very differently to a user. Being
   * displaced by another project is "your session moved"; being displaced by the console is "you
   * went back to the console" -- and telling someone their project is "open in another window"
   * when they actually returned to the console would send them looking for a window that is not
   * there.
   */
  detachedReason: DetachedReason | null;
  /** Tenant that took the session, so the UI can name it rather than say "another window". */
  detachedTenantId: string | null;
  setImpersonation: (
    isImpersonated: boolean,
    originalTenantId: string | null,
    impersonatedTenantId: string | null,
  ) => void;
  impersonate: (impersonatedTenantId: string, originalTenantId: string) => void;
  terminate: (originalTenantId: string) => void;
  setInitialized: (isInitialized: boolean) => void;
  setImpersonationError: (impersonationError: unknown) => void;
  setDetached: (
    detachedReason: DetachedReason | null,
    detachedTenantId?: string | null,
  ) => void;
  reset: () => void;
}

export const useImpersonateStore = create<ImpersonateStoreState>()((set) => ({
  isImpersonated: false,
  impersonatedTenantId: null,
  originalTenantId: null,
  isInitialized: false,
  impersonationError: null,
  detachedReason: null,
  detachedTenantId: null,
  setImpersonation: (
    isImpersonated: boolean,
    originalTenantId: string | null,
    impersonatedTenantId: string | null,
  ) => {
    set({ isImpersonated, impersonatedTenantId, originalTenantId });
  },
  impersonate: (impersonatedTenantId: string, originalTenantId: string) => {
    // A successful impersonation clears both failure states: this tab now owns the cookie and is
    // pointed at the tenant it believes it is pointed at.
    set({
      isImpersonated: true,
      impersonatedTenantId,
      originalTenantId,
      impersonationError: null,
      detachedReason: null,
      detachedTenantId: null,
    });
  },
  terminate: (originalTenantId: string) => {
    set((state) => ({
      ...state,
      isImpersonated: false,
      impersonatedTenantId: null,
      originalTenantId,
    }));
  },
  setInitialized: (isInitialized: boolean) => {
    set({ isInitialized });
  },
  setImpersonationError: (impersonationError: unknown) => {
    set({ impersonationError });
  },
  setDetached: (
    detachedReason: DetachedReason | null,
    detachedTenantId: string | null = null,
  ) => {
    set({ detachedReason, detachedTenantId });
  },
  reset: () => {
    set({
      isImpersonated: false,
      impersonatedTenantId: null,
      originalTenantId: null,
      isInitialized: false,
      impersonationError: null,
      detachedReason: null,
      detachedTenantId: null,
    });
  },
}));
