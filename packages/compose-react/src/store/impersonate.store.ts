import { create } from "zustand";

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
   * True when another tab has claimed the shared access-token cookie for a different tenant.
   * A detached tab must issue no requests: its own state is stale, and the cookie underneath it
   * now belongs to someone else.
   */
  isDetached: boolean;
  setImpersonation: (
    isImpersonated: boolean,
    originalTenantId: string | null,
    impersonatedTenantId: string | null,
  ) => void;
  impersonate: (impersonatedTenantId: string, originalTenantId: string) => void;
  terminate: (originalTenantId: string) => void;
  setInitialized: (isInitialized: boolean) => void;
  setImpersonationError: (impersonationError: unknown) => void;
  setDetached: (isDetached: boolean) => void;
  reset: () => void;
}

export const useImpersonateStore = create<ImpersonateStoreState>()((set) => ({
  isImpersonated: false,
  impersonatedTenantId: null,
  originalTenantId: null,
  isInitialized: false,
  impersonationError: null,
  isDetached: false,
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
      isDetached: false,
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
  setDetached: (isDetached: boolean) => {
    set({ isDetached });
  },
  reset: () => {
    set({
      isImpersonated: false,
      impersonatedTenantId: null,
      originalTenantId: null,
      isInitialized: false,
      impersonationError: null,
      isDetached: false,
    });
  },
}));
