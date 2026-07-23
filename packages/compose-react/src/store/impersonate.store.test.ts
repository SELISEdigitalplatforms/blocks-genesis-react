import { describe, it, expect, beforeEach } from "vitest";
import { useImpersonateStore } from "@/store/impersonate.store";

describe("useImpersonateStore", () => {
  beforeEach(() => useImpersonateStore.getState().reset());

  it("starts without an active impersonation", () => {
    const state = useImpersonateStore.getState();
    expect(state.isImpersonated).toBe(false);
    expect(state.isInitialized).toBe(false);
    expect(state.originalTenantId).toBeNull();
  });

  it("setImpersonation applies all three fields", () => {
    useImpersonateStore.getState().setImpersonation(true, "orig", "imp");
    const state = useImpersonateStore.getState();
    expect(state.isImpersonated).toBe(true);
    expect(state.originalTenantId).toBe("orig");
    expect(state.impersonatedTenantId).toBe("imp");
  });

  it("impersonate marks impersonation active", () => {
    useImpersonateStore.getState().impersonate("imp", "orig");
    const state = useImpersonateStore.getState();
    expect(state.isImpersonated).toBe(true);
    expect(state.impersonatedTenantId).toBe("imp");
    expect(state.originalTenantId).toBe("orig");
  });

  it("terminate clears the impersonated tenant but keeps the original", () => {
    useImpersonateStore.getState().impersonate("imp", "orig");
    useImpersonateStore.getState().terminate("orig");
    const state = useImpersonateStore.getState();
    expect(state.isImpersonated).toBe(false);
    expect(state.impersonatedTenantId).toBeNull();
    expect(state.originalTenantId).toBe("orig");
  });

  it("setInitialized toggles the initialized flag", () => {
    useImpersonateStore.getState().setInitialized(true);
    expect(useImpersonateStore.getState().isInitialized).toBe(true);
  });

  it("reset returns the store to its initial state", () => {
    useImpersonateStore.getState().impersonate("imp", "orig");
    useImpersonateStore.getState().setInitialized(true);
    useImpersonateStore.getState().reset();
    const state = useImpersonateStore.getState();
    expect(state.isImpersonated).toBe(false);
    expect(state.isInitialized).toBe(false);
    expect(state.originalTenantId).toBeNull();
  });
});
