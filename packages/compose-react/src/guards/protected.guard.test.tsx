import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProtectedGuard } from "@/guards/protected.guard";
import { useAuthStore } from "@/store/auth.store";

const h = vi.hoisted(() => ({
  onSignOut: undefined as (() => void) | undefined,
}));

vi.mock("@/lib/tenant-ownership", () => ({
  subscribeToSignOut: (cb: () => void) => {
    h.onSignOut = cb;
    return () => {
      h.onSignOut = undefined;
    };
  },
}));

const originalLocation = window.location;

describe("ProtectedGuard", () => {
  beforeEach(() => {
    useAuthStore.getState().setAuthenticated();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { origin: "https://app.test", replace: vi.fn() },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("reloads to the login page when another tab signs out", () => {
    render(
      <MemoryRouter>
        <ProtectedGuard>
          <div>app</div>
        </ProtectedGuard>
      </MemoryRouter>,
    );

    h.onSignOut?.();

    expect(window.location.replace).toHaveBeenCalledWith(
      "https://app.test/login",
    );
  });

  it("stops listening once it unmounts", () => {
    const { unmount } = render(
      <MemoryRouter>
        <ProtectedGuard>
          <div>app</div>
        </ProtectedGuard>
      </MemoryRouter>,
    );

    unmount();

    expect(h.onSignOut).toBeUndefined();
  });
});
