import { renderHook, waitFor } from "@testing-library/react";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useInitiateRedirect, usePrefetchRedirect } from "./use-initiate";

const h = vi.hoisted(() => ({ fetchRedirectUrl: vi.fn() }));

vi.mock("@/services/initiate.service", () => ({
  initiateService: { fetchRedirectUrl: h.fetchRedirectUrl },
}));

const replaceMock = vi.fn();
const params = {
  clientId: "cid",
  redirectUri: "https://app/cb",
  forwardedTo: "/home",
};

describe("use-initiate hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { replace: replaceMock, href: "https://test.local/" },
    });
  });

  describe("useInitiateRedirect", () => {
    it("redirects to the resolved url and stops loading", async () => {
      h.fetchRedirectUrl.mockResolvedValue("https://dest/go");

      const { result } = renderHook(() => useInitiateRedirect(params));

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(replaceMock).toHaveBeenCalledWith("https://dest/go");
      expect(result.current.error).toBeNull();
    });

    it("captures an Error rejection", async () => {
      const boom = new Error("network down");
      h.fetchRedirectUrl.mockRejectedValue(boom);

      const { result } = renderHook(() => useInitiateRedirect(params));

      await waitFor(() => expect(result.current.error).toBe(boom));
      expect(result.current.isLoading).toBe(false);
    });

    it("wraps a non-Error rejection with a default message", async () => {
      h.fetchRedirectUrl.mockRejectedValue("string failure");

      const { result } = renderHook(() => useInitiateRedirect(params));

      await waitFor(() =>
        expect(result.current.error?.message).toBe("Failed to redirect"),
      );
    });

    it("initiates the redirect only once across rerenders", async () => {
      h.fetchRedirectUrl.mockResolvedValue("https://dest/go");

      const { rerender, result } = renderHook(() =>
        useInitiateRedirect(params),
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      rerender();

      expect(h.fetchRedirectUrl).toHaveBeenCalledTimes(1);
    });
  });

  describe("usePrefetchRedirect", () => {
    it("prefetches the url and becomes ready, then redirects on demand", async () => {
      h.fetchRedirectUrl.mockResolvedValue("https://dest/prefetch");

      const { result } = renderHook(() => usePrefetchRedirect(params));

      await waitFor(() => expect(result.current.isReady).toBe(true));
      expect(result.current.isFetching).toBe(false);

      act(() => result.current.redirect());
      expect(replaceMock).toHaveBeenCalledWith("https://dest/prefetch");
    });

    it("does nothing when disabled", async () => {
      const { result } = renderHook(() =>
        usePrefetchRedirect({ ...params, enabled: false }),
      );

      expect(h.fetchRedirectUrl).not.toHaveBeenCalled();
      expect(result.current.isReady).toBe(false);

      act(() => result.current.redirect());
      expect(replaceMock).not.toHaveBeenCalled();
    });

    it("logs and stays not-ready when the prefetch rejects", async () => {
      h.fetchRedirectUrl.mockRejectedValue(new Error("nope"));

      const { result } = renderHook(() => usePrefetchRedirect(params));

      await waitFor(() => expect(result.current.isFetching).toBe(false));
      expect(result.current.isReady).toBe(false);
    });
  });
});
