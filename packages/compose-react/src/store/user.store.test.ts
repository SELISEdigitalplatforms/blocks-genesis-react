import { describe, it, expect, beforeEach } from "vitest";
import { useUserStore } from "@/store/user.store";

describe("useUserStore", () => {
  beforeEach(() => useUserStore.getState().resetUserStore());

  it("starts with no user details", () => {
    expect(useUserStore.getState().userDetails).toBeNull();
  });

  it("setUserDetails stores the details", () => {
    useUserStore.getState().setUserDetails({ id: "u1" } as never);
    expect(useUserStore.getState().userDetails).toEqual({ id: "u1" });
  });

  it("resetUserStore clears the details", () => {
    useUserStore.getState().setUserDetails({ id: "u1" } as never);
    useUserStore.getState().resetUserStore();
    expect(useUserStore.getState().userDetails).toBeNull();
  });
});
