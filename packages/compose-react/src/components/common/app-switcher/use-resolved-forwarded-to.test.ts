import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { useResolvedForwardedTo } from "./use-resolved-forwarded-to";

describe("useResolvedForwardedTo", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, "location", {
      value: { ...originalLocation, pathname: "/app/console" },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
    vi.restoreAllMocks();
  });

  it("prefers the per-app default over the prop and the fallback", () => {
    const result = useResolvedForwardedTo({
      appForwardedTo: "/app/profile",
      propForwardedTo: "/app/console",
    });
    expect(result).toBe("/app/profile");
  });

  it("falls back to the prop when the app has no default", () => {
    const result = useResolvedForwardedTo({
      propForwardedTo: "/app/dashboard",
    });
    expect(result).toBe("/app/dashboard");
  });

  it("falls back to getForwardedToPath when neither override is provided", () => {
    const result = useResolvedForwardedTo({});
    expect(result).toBe("/app/console");
  });

  it("returns the prop for an unknown current page when nothing else is set", () => {
    Object.defineProperty(window, "location", {
      value: { ...originalLocation, pathname: "/" },
      writable: true,
      configurable: true,
    });
    const result = useResolvedForwardedTo({});
    expect(result).toBe("/app/console");
  });
});
