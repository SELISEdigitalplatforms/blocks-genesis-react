import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/store/auth.store";

describe("useAuthStore", () => {
  beforeEach(() => useAuthStore.getState().resetAuthStore());

  it("starts unauthenticated with no user or tokens", () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
  });

  it("setUser stores the current user", () => {
    useAuthStore.getState().setUser({ id: "u1" } as never);
    expect(useAuthStore.getState().user).toEqual({ id: "u1" });
  });

  it("setAuthenticated and setUnAuthenticated toggle auth and clear the user", () => {
    useAuthStore.getState().setUser({ id: "u1" } as never);
    useAuthStore.getState().setAuthenticated();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    useAuthStore.getState().setUnAuthenticated();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("setTokens and clearTokens manage the token pair", () => {
    useAuthStore.getState().setTokens("access", "refresh");
    expect(useAuthStore.getState().accessToken).toBe("access");
    expect(useAuthStore.getState().refreshToken).toBe("refresh");
    useAuthStore.getState().clearTokens();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().refreshToken).toBeNull();
  });

  it("resetAuthStore returns the store to its initial state", () => {
    useAuthStore.getState().setTokens("access", "refresh");
    useAuthStore.getState().setAuthenticated();
    useAuthStore.getState().resetAuthStore();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
  });
});
