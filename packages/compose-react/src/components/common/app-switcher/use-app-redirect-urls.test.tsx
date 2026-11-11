import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
  onlineManager,
} from "@tanstack/react-query";
import type { ReactNode } from "react";

import {
  INITIATE_URL_MAX_AGE_MS,
  useAppRedirectUrls,
} from "./use-app-redirect-urls";
import type { BlocksApp } from "./app-switcher.types";
import type { RuntimeKey } from "@/types";
import { InitiateError } from "@/services/initiate.service";

const fetchRedirectUrl = vi.fn();

vi.mock("@/services/initiate.service", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/services/initiate.service")>()),
  initiateService: {
    fetchRedirectUrl: (...args: unknown[]) => fetchRedirectUrl(...args),
  },
}));

/** A request that never settles: still in flight. */
const inFlight = () => new Promise<string>(() => undefined);

const rejectedBy = (status: number) =>
  new InitiateError(status, { code: "invalid_redirect_uri" });

/** A request that stays in flight until its signal aborts, then rejects like `fetch` does. */
const pendingUntilAborted = (_: unknown, signal: AbortSignal) =>
  new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () =>
      reject(new DOMException("The operation was aborted.", "AbortError")),
    );
  });

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

  describe("when IAM rejects an app", () => {
    // H7, §7 #1
    it("marks the app unavailable, not loading, with no URL", async () => {
      fetchRedirectUrl.mockRejectedValue(rejectedBy(400));
      const { result } = renderSwitcher([makeApp("blocks-agents")]);

      await waitFor(() => expect(result.current[0]?.isUnavailable).toBe(true));
      expect(result.current[0]?.isLoading).toBe(false);
      expect(result.current[0]?.initiateUrl).toBe("");
    });

    // H8
    it("is loading, not unavailable, while the request is in flight", () => {
      fetchRedirectUrl.mockReturnValue(inFlight());
      const { result } = renderSwitcher([makeApp("blocks-agents")]);

      expect(result.current[0]).toMatchObject({
        isLoading: true,
        isUnavailable: false,
      });
    });

    // H9
    it("leaves every other app to its own request", async () => {
      const answers: Record<string, () => Promise<string>> = {
        "/agents": () => Promise.reject(rejectedBy(400)),
        "/os": () => Promise.resolve("https://redirect.test/os"),
      };
      fetchRedirectUrl.mockImplementation(
        ({ forwardedTo }: { forwardedTo: string }) =>
          answers[forwardedTo]?.() ?? inFlight(),
      );
      const paths: Record<string, string> = {
        "blocks-agents": "/agents",
        "blocks-os": "/os",
        "blocks-data": "/data",
      };
      const { result } = renderHook(
        () =>
          useAppRedirectUrls({
            open: true,
            apps: Object.keys(paths).map(makeApp),
            resolveForwardedTo: (app) => paths[app.id] ?? "",
          }),
        { wrapper },
      );

      await waitFor(() => {
        const [agents, os] = result.current;
        expect(agents?.isUnavailable).toBe(true);
        expect(os?.initiateUrl).toBe("https://redirect.test/os");
      });
      expect(result.current[1]).toMatchObject({
        isLoading: false,
        isUnavailable: false,
      });
      expect(result.current[2]).toMatchObject({
        isLoading: true,
        isUnavailable: false,
      });
    });

    // H10, A2
    it("does not ask again on a reopen within the max age after a 4xx", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      fetchRedirectUrl.mockRejectedValue(rejectedBy(400));
      const { result, rerender } = renderSwitcher([makeApp("blocks-agents")]);
      await waitFor(() => expect(result.current[0]?.isUnavailable).toBe(true));
      rerender({ open: false });

      vi.setSystemTime(Date.now() + INITIATE_URL_MAX_AGE_MS - 1000);
      rerender({ open: true });

      expect(result.current[0]?.isUnavailable).toBe(true);
      await vi.advanceTimersByTimeAsync(10);
      expect(fetchRedirectUrl).toHaveBeenCalledTimes(1);
    });

    // H11
    it("asks again on a reopen after the max age, loading until it settles", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      fetchRedirectUrl
        .mockRejectedValueOnce(rejectedBy(400))
        .mockResolvedValueOnce("https://redirect.test/fixed");
      const { result, rerender } = renderSwitcher([makeApp("blocks-agents")]);
      await waitFor(() => expect(result.current[0]?.isUnavailable).toBe(true));
      rerender({ open: false });

      vi.setSystemTime(Date.now() + INITIATE_URL_MAX_AGE_MS + 1000);
      rerender({ open: true });

      expect(result.current[0]).toMatchObject({
        isLoading: true,
        isUnavailable: false,
      });
      await waitFor(() =>
        expect(result.current[0]?.initiateUrl).toBe(
          "https://redirect.test/fixed",
        ),
      );
      expect(fetchRedirectUrl).toHaveBeenCalledTimes(2);
    });

    // H8 with an aged URL still cached: the retry after a rejection shows "Loading…".
    it("is loading, not unavailable, while retrying a key whose last URL aged out", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      fetchRedirectUrl
        .mockResolvedValueOnce("https://redirect.test/old")
        .mockRejectedValueOnce(rejectedBy(400))
        .mockReturnValueOnce(inFlight());
      const { result, rerender } = renderSwitcher([makeApp("blocks-agents")]);
      await waitFor(() => expect(result.current[0]?.isLoading).toBe(false));
      rerender({ open: false });

      vi.setSystemTime(Date.now() + INITIATE_URL_MAX_AGE_MS + 1000);
      rerender({ open: true });
      await waitFor(() => expect(result.current[0]?.isUnavailable).toBe(true));
      rerender({ open: false });

      vi.setSystemTime(Date.now() + INITIATE_URL_MAX_AGE_MS + 1000);
      rerender({ open: true });

      await waitFor(() => expect(fetchRedirectUrl).toHaveBeenCalledTimes(3));
      expect(result.current[0]).toMatchObject({
        isLoading: true,
        isUnavailable: false,
        initiateUrl: "",
      });
    });

    // H8 offline: a retry that waits for the network is still a request, not a failure.
    it("is loading, not unavailable, while a retry waits for the network", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      fetchRedirectUrl
        .mockResolvedValueOnce("https://redirect.test/old")
        .mockRejectedValueOnce(rejectedBy(500))
        .mockReturnValueOnce(inFlight());
      const { result, rerender } = renderSwitcher([makeApp("blocks-agents")]);
      await waitFor(() => expect(result.current[0]?.isLoading).toBe(false));
      rerender({ open: false });

      vi.setSystemTime(Date.now() + INITIATE_URL_MAX_AGE_MS + 1000);
      rerender({ open: true });
      await waitFor(() => expect(result.current[0]?.isUnavailable).toBe(true));
      rerender({ open: false });

      onlineManager.setOnline(false);
      try {
        rerender({ open: true });

        await waitFor(() =>
          expect(result.current[0]).toMatchObject({
            isLoading: true,
            isUnavailable: false,
          }),
        );
        expect(fetchRedirectUrl).toHaveBeenCalledTimes(2);
      } finally {
        onlineManager.setOnline(true);
      }
    });

    // C5: a 5xx may be transient.
    it("asks again on the next open after a 5xx", async () => {
      fetchRedirectUrl.mockRejectedValueOnce(rejectedBy(500));
      fetchRedirectUrl.mockReturnValueOnce(inFlight());
      const { result, rerender } = renderSwitcher([makeApp("blocks-agents")]);
      await waitFor(() => expect(result.current[0]?.isUnavailable).toBe(true));

      rerender({ open: false });
      rerender({ open: true });

      await waitFor(() => expect(fetchRedirectUrl).toHaveBeenCalledTimes(2));
      expect(result.current[0]?.isLoading).toBe(true);
    });

    // C6, §7 #6
    it("marks the app unavailable after a network failure and asks again on the next open", async () => {
      fetchRedirectUrl.mockRejectedValueOnce(new TypeError("Failed to fetch"));
      fetchRedirectUrl.mockReturnValueOnce(inFlight());
      const { result, rerender } = renderSwitcher([makeApp("blocks-agents")]);
      await waitFor(() => expect(result.current[0]?.isUnavailable).toBe(true));

      rerender({ open: false });
      rerender({ open: true });

      await waitFor(() => expect(fetchRedirectUrl).toHaveBeenCalledTimes(2));
    });

    // C7
    it("shows loading, not unavailable, after a request was aborted mid-flight", async () => {
      fetchRedirectUrl.mockImplementationOnce(pendingUntilAborted);
      fetchRedirectUrl.mockReturnValueOnce(inFlight());
      const apps = [makeApp("blocks-agents")];
      const first = renderSwitcher(apps);
      await waitFor(() => expect(fetchRedirectUrl).toHaveBeenCalledTimes(1));
      // The switcher unmounting is what aborts a request; closing alone keeps the observer.
      first.unmount();

      const { result } = renderSwitcher(apps);

      expect(result.current[0]).toMatchObject({
        isLoading: true,
        isUnavailable: false,
      });
      await waitFor(() => expect(fetchRedirectUrl).toHaveBeenCalledTimes(2));
      expect(result.current[0]?.isUnavailable).toBe(false);
    });

    // C8
    it("shows loading, not unavailable, while a used URL is replaced", async () => {
      fetchRedirectUrl
        .mockResolvedValueOnce("https://redirect.test/state-1")
        .mockReturnValueOnce(inFlight());
      const { result } = renderSwitcher([makeApp("blocks-agents")]);
      await waitFor(() => expect(result.current[0]?.isLoading).toBe(false));

      act(() => result.current[0]?.markUsed());

      await waitFor(() => expect(fetchRedirectUrl).toHaveBeenCalledTimes(2));
      expect(result.current[0]).toMatchObject({
        isLoading: true,
        isUnavailable: false,
      });
    });
  });
});
