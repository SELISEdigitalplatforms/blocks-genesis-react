import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import {
  INITIATE_URL_MAX_AGE_MS,
  useAppRedirectUrls,
} from "./use-app-redirect-urls";
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

let client: QueryClient;
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

/** Renders the hook with a toggleable `open`, the way the popover drives it. */
const renderSwitcher = (apps: BlocksApp[], forwardedTo = "/app/profile") =>
  renderHook(
    ({ open }: { open: boolean }) =>
      useAppRedirectUrls({ open, apps, resolveForwardedTo: () => forwardedTo }),
    { wrapper, initialProps: { open: true } },
  );

describe("useAppRedirectUrls", () => {
  beforeEach(() => {
    fetchRedirectUrl.mockReset();
    client = new QueryClient();
  });

  afterEach(() => {
    vi.useRealTimers();
    client.clear();
  });

  it("returns an empty list when the popover is closed", () => {
    fetchRedirectUrl.mockResolvedValue("https://redirect.test");
    const { result } = renderHook(
      () =>
        useAppRedirectUrls({
          open: false,
          apps: [makeApp("blocks-iam")],
          resolveForwardedTo: () => "/app/profile",
        }),
      { wrapper },
    );
    expect(result.current).toEqual([]);
    expect(fetchRedirectUrl).not.toHaveBeenCalled();
  });

  it("fetches a redirect URL per app when opened", async () => {
    fetchRedirectUrl.mockResolvedValue("https://redirect.test");
    const apps = [makeApp("blocks-iam"), makeApp("blocks-os")];

    const { result } = renderHook(
      () =>
        useAppRedirectUrls({
          open: true,
          apps,
          resolveForwardedTo: (app) =>
            app.id === "blocks-iam" ? "/app/profile" : "/app/console",
        }),
      { wrapper },
    );

    await waitFor(() => expect(fetchRedirectUrl).toHaveBeenCalledTimes(2));
    expect(fetchRedirectUrl).toHaveBeenCalledWith(
      {
        clientId: "https://test.local",
        redirectUri: "https://test.local",
        forwardedTo: "/app/profile",
      },
      expect.any(AbortSignal),
    );

    await waitFor(() => {
      const iam = result.current.find((a) => a.id === "blocks-iam");
      expect(iam?.initiateUrl).toBe("https://redirect.test");
      expect(iam?.isLoading).toBe(false);
    });
  });

  it("marks unresolved apps as loading", () => {
    fetchRedirectUrl.mockReturnValue(new Promise(() => {}));
    const { result } = renderSwitcher([makeApp("blocks-iam")]);
    expect(result.current[0]?.isLoading).toBe(true);
    expect(result.current[0]?.initiateUrl).toBe("");
  });

  it("reuses the URLs when the popover is reopened", async () => {
    fetchRedirectUrl.mockResolvedValue("https://redirect.test");
    const { result, rerender } = renderSwitcher([makeApp("blocks-iam")]);
    await waitFor(() => expect(result.current[0]?.isLoading).toBe(false));

    rerender({ open: false });
    rerender({ open: true });

    // Every open used to call /idp/initiate again for every app.
    expect(result.current[0]?.initiateUrl).toBe("https://redirect.test");
    expect(fetchRedirectUrl).toHaveBeenCalledTimes(1);
  });

  it("swaps in a fresh URL once one is used, because its state is single-use", async () => {
    fetchRedirectUrl
      .mockResolvedValueOnce("https://redirect.test/state-1")
      .mockResolvedValueOnce("https://redirect.test/state-2");
    const { result } = renderSwitcher([makeApp("blocks-iam")]);
    await waitFor(() =>
      expect(result.current[0]?.initiateUrl).toBe(
        "https://redirect.test/state-1",
      ),
    );

    act(() => result.current[0]?.markUsed());

    // Not synchronously: the browser has yet to follow the link that used it.
    expect(result.current[0]?.initiateUrl).toBe(
      "https://redirect.test/state-1",
    );
    await waitFor(() =>
      expect(result.current[0]?.initiateUrl).toBe(
        "https://redirect.test/state-2",
      ),
    );
    expect(fetchRedirectUrl).toHaveBeenCalledTimes(2);
  });

  it("never hands out a URL older than the max age", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    fetchRedirectUrl
      .mockResolvedValueOnce("https://redirect.test/old")
      .mockReturnValueOnce(new Promise(() => {}));
    const { result, rerender } = renderSwitcher([makeApp("blocks-iam")]);
    await waitFor(() => expect(result.current[0]?.isLoading).toBe(false));
    rerender({ open: false });

    vi.setSystemTime(Date.now() + INITIATE_URL_MAX_AGE_MS + 1000);
    rerender({ open: true });

    // Too little of IAM's 10-minute window would be left to finish signing in.
    expect(result.current[0]?.isLoading).toBe(true);
    await waitFor(() => expect(fetchRedirectUrl).toHaveBeenCalledTimes(2));
  });

  it("fetches separately per forwardedTo, so a URL never lands on the wrong page", async () => {
    fetchRedirectUrl.mockResolvedValue("https://redirect.test");
    const apps = [makeApp("blocks-iam")];
    const first = renderSwitcher(apps, "/app/a");
    await waitFor(() => expect(first.result.current[0]?.isLoading).toBe(false));
    first.unmount();

    renderSwitcher(apps, "/app/b");

    await waitFor(() => expect(fetchRedirectUrl).toHaveBeenCalledTimes(2));
    expect(fetchRedirectUrl).toHaveBeenLastCalledWith(
      expect.objectContaining({ forwardedTo: "/app/b" }),
      expect.any(AbortSignal),
    );
  });
});
