import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import { useAppRedirectUrls } from "./use-app-redirect-urls";
import type { BlocksApp } from "./app-switcher.types";
import type { RuntimeKey } from "@/types";

const fetchRedirectUrl = vi.fn();

vi.mock("@/services/initiate.service", () => ({
  initiateService: {
    fetchRedirectUrl: (...args: unknown[]) => fetchRedirectUrl(...args),
  },
}));

const makeApp = (id: string): BlocksApp => ({
  id: id as BlocksApp["id"],
  label: id,
  description: "",
  url: "",
  icon: null,
  clientId: "CID" as RuntimeKey,
  redirectUri: "RID" as RuntimeKey,
  initiateUrl: "",
  isLoading: false,
  isDisabled: false,
});

describe("useAppRedirectUrls", () => {
  beforeEach(() => {
    fetchRedirectUrl.mockReset();
  });

  it("returns an empty list when the popover is closed", () => {
    fetchRedirectUrl.mockResolvedValue("https://redirect.test");
    const { result } = renderHook(() =>
      useAppRedirectUrls({
        open: false,
        apps: [makeApp("blocks-iam")],
        resolveForwardedTo: () => "/app/profile",
      }),
    );
    expect(result.current).toEqual([]);
    expect(fetchRedirectUrl).not.toHaveBeenCalled();
  });

  it("fetches a redirect URL per app when opened", async () => {
    fetchRedirectUrl.mockResolvedValue("https://redirect.test");
    const apps = [makeApp("blocks-iam"), makeApp("blocks-os")];

    const { result } = renderHook(() =>
      useAppRedirectUrls({
        open: true,
        apps,
        resolveForwardedTo: (app) =>
          app.id === "blocks-iam" ? "/app/profile" : "/app/console",
      }),
    );

    expect(fetchRedirectUrl).toHaveBeenCalledTimes(2);
    expect(fetchRedirectUrl).toHaveBeenCalledWith({
      clientId: "https://test.local",
      redirectUri: "https://test.local",
      forwardedTo: "/app/profile",
    });

    await waitFor(() => {
      const iam = result.current.find((a) => a.id === "blocks-iam");
      return iam?.initiateUrl === "https://redirect.test";
    });

    const iam = result.current.find((a) => a.id === "blocks-iam");
    expect(iam?.initiateUrl).toBe("https://redirect.test");
    expect(iam?.isLoading).toBe(false);
  });

  it("marks unresolved apps as loading", () => {
    fetchRedirectUrl.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() =>
      useAppRedirectUrls({
        open: true,
        apps: [makeApp("blocks-iam")],
        resolveForwardedTo: () => "/app/profile",
      }),
    );
    expect(result.current[0]?.isLoading).toBe(true);
    expect(result.current[0]?.initiateUrl).toBe("");
  });
});
