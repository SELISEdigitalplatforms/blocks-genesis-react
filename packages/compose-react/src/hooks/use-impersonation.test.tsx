import { act, renderHook, waitFor } from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HttpClient } from "@/lib/http/client";
import { HttpError } from "@/lib/http/error";
import type { SessionTenantGuard } from "@/lib/http/types";
import { getRuntimeEnv } from "@/lib/runtime-env";
import { useImpersonateStore } from "@/store/impersonate.store";
import {
  useImpersonationStatusChecker,
  useRecordClaimedTenant,
  useSessionTenantGuard,
  useStartImpersonation,
  useStatusFirstOnTabReturn,
  useStopImpersonation,
} from "./use-impersonation";

const h = vi.hoisted(() => ({
  impersonationStatus: vi.fn(),
  stopImpersonation: vi.fn(),
  startImpersonation: vi.fn(),
  claimTenant: vi.fn(),
  withSessionLock: vi.fn(),
  refreshWithinSessionLock: vi.fn(),
}));

vi.mock("@/services/impersonation.service", () => ({
  impersonationService: {
    impersonationStatus: h.impersonationStatus,
    stopImpersonation: h.stopImpersonation,
    startImpersonation: h.startImpersonation,
  },
}));

vi.mock("@/lib/http/instances", () => ({
  iamClient: {
    withSessionLock: h.withSessionLock,
    refreshWithinSessionLock: h.refreshWithinSessionLock,
  },
}));

vi.mock("@/lib/tenant-ownership", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/tenant-ownership")>()),
  claimTenant: h.claimTenant,
}));

const ROOT = "root";

/** IAM's success shape: the cookie was replaced, so the browser is now on the target tenant. */
const cookieReplaced = { cookie_set: true, impersonation_mode: true };

const statusIn = (impersonatedTenantId: string | null) => ({
  impersonated: impersonatedTenantId !== null,
  originalTenantId: ROOT,
  impersonatedTenantId,
});

/** The options every call made while holding the session lock must carry. */
const insideLock = { skipTokenRotation: true, skipSessionCheck: true };

const expiredAccessToken = () => new HttpError(401, { errors: {} });

const STATUS_KEY = ["blocks-kit-impersonation", "status"];

let client: QueryClient;
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

beforeEach(() => {
  vi.clearAllMocks();
  (window as unknown as { process?: { env: Record<string, string> } }).process =
    { env: { BLOCKS_X_BLOCKS_KEY: ROOT } };
  h.withSessionLock.mockImplementation((fn: () => Promise<unknown>) => fn());
  h.refreshWithinSessionLock.mockResolvedValue(undefined);
  useImpersonateStore.getState().reset();
  client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
});

describe("useImpersonationStatusChecker", () => {
  it("fetches the current impersonation status", async () => {
    h.impersonationStatus.mockResolvedValue(statusIn("imp"));

    const { result } = renderHook(() => useImpersonationStatusChecker(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.impersonatedTenantId).toBe("imp");
  });

  it("is never held back for disagreeing with the tenant the page expects", async () => {
    // The status is what tells the page which tenant it is in.
    h.impersonationStatus.mockResolvedValue(statusIn(null));

    renderHook(() => useImpersonationStatusChecker(), { wrapper });

    await waitFor(() =>
      expect(h.impersonationStatus).toHaveBeenCalledWith({
        skipSessionCheck: true,
      }),
    );
  });
});

describe("useStopImpersonation", () => {
  it("settles with where the server says the session is, and caches it", async () => {
    h.stopImpersonation.mockResolvedValue(undefined);
    h.impersonationStatus.mockResolvedValue(statusIn(null));

    const { result } = renderHook(() => useStopImpersonation(), { wrapper });
    const outcome = await result.current.mutateAsync(undefined);

    expect(outcome).toEqual({ status: statusIn(null), stopError: null });
    expect(h.stopImpersonation).toHaveBeenCalledWith(insideLock);
    await waitFor(() =>
      expect(client.getQueryData(STATUS_KEY)).toEqual(statusIn(null)),
    );
  });

  it("asks the server, rather than guessing, when the stop call fails", async () => {
    // A stop that 500s or never leaves the browser leaves the session in the project.
    // Recording "stopped" for it put the client into a state the server did not share.
    const failure = new TypeError("Failed to fetch");
    h.stopImpersonation.mockRejectedValue(failure);
    h.impersonationStatus.mockResolvedValue(statusIn("imp"));

    const { result } = renderHook(() => useStopImpersonation(), { wrapper });
    const outcome = await result.current.mutateAsync(undefined);

    expect(outcome).toEqual({ status: statusIn("imp"), stopError: failure });
    await waitFor(() =>
      expect(client.getQueryData(STATUS_KEY)).toEqual(statusIn("imp")),
    );
  });

  it("refreshes and stops again when the access token had expired", async () => {
    // A bare 401 used to be read as "already stopped", and the console rendered on the project's
    // token.
    h.stopImpersonation
      .mockRejectedValueOnce(expiredAccessToken())
      .mockResolvedValueOnce(undefined);
    h.impersonationStatus.mockResolvedValue(statusIn(null));

    const { result } = renderHook(() => useStopImpersonation(), { wrapper });
    const outcome = await result.current.mutateAsync(undefined);

    expect(h.refreshWithinSessionLock).toHaveBeenCalledTimes(1);
    expect(h.stopImpersonation).toHaveBeenCalledTimes(2);
    expect(outcome.stopError).toBeNull();
  });

  it("does not refresh for a refusal IAM gave a reason for", async () => {
    const refusal = new HttpError(401, {
      errors: { error: "invalid_refresh_token" },
    });
    h.stopImpersonation.mockRejectedValue(refusal);
    h.impersonationStatus.mockResolvedValue(statusIn("imp"));

    const { result } = renderHook(() => useStopImpersonation(), { wrapper });
    const outcome = await result.current.mutateAsync(undefined);

    expect(h.refreshWithinSessionLock).not.toHaveBeenCalled();
    expect(outcome).toEqual({ status: statusIn("imp"), stopError: refusal });
  });

  it("runs inside the session lock", async () => {
    h.stopImpersonation.mockResolvedValue(undefined);
    h.impersonationStatus.mockResolvedValue(statusIn(null));

    const { result } = renderHook(() => useStopImpersonation(), { wrapper });
    await result.current.mutateAsync(undefined);

    expect(h.withSessionLock).toHaveBeenCalledTimes(1);
  });

  it("fails when the server cannot be asked where the session is", async () => {
    h.stopImpersonation.mockResolvedValue(undefined);
    h.impersonationStatus.mockRejectedValue(new TypeError("Failed to fetch"));

    const { result } = renderHook(() => useStopImpersonation(), { wrapper });

    await expect(result.current.mutateAsync(undefined)).rejects.toThrow();
  });
});

describe("useStartImpersonation", () => {
  it("caches the status the server confirms after the start", async () => {
    h.startImpersonation.mockResolvedValue(cookieReplaced);
    h.impersonationStatus.mockResolvedValue(statusIn("tenant-9"));

    const { result } = renderHook(() => useStartImpersonation(), { wrapper });
    await result.current.mutateAsync({ targeted_tenant_id: "tenant-9" });

    expect(h.startImpersonation).toHaveBeenCalledWith(
      { targeted_tenant_id: "tenant-9" },
      insideLock,
    );
    await waitFor(() =>
      expect(client.getQueryData(STATUS_KEY)).toEqual(statusIn("tenant-9")),
    );
  });

  it("claims the cookie for the other tabs on start", async () => {
    // Every entry path claims, not just the route guard: the environment cards call this hook
    // directly, and they are the main way into a project.
    h.startImpersonation.mockResolvedValue(cookieReplaced);
    h.impersonationStatus.mockResolvedValue(statusIn("tenant-9"));

    const { result } = renderHook(() => useStartImpersonation(), { wrapper });
    await result.current.mutateAsync({ targeted_tenant_id: "tenant-9" });

    await waitFor(() => expect(h.claimTenant).toHaveBeenCalledWith("tenant-9"));
  });

  it("compares tenant ids without regard to case", async () => {
    h.startImpersonation.mockResolvedValue(cookieReplaced);
    h.impersonationStatus.mockResolvedValue(statusIn("TENANT-9"));

    const { result } = renderHook(() => useStartImpersonation(), { wrapper });

    await expect(
      result.current.mutateAsync({ targeted_tenant_id: "tenant-9" }),
    ).resolves.toEqual(cookieReplaced);
  });

  it("fails when the server does not confirm the session is in the project", async () => {
    // cookie_set describes the response, not the cookie: one that lands after it -- another tab, or
    // a refresh this tab had in flight -- can replace it.
    h.startImpersonation.mockResolvedValue(cookieReplaced);
    h.impersonationStatus.mockResolvedValue(statusIn("another-tenant"));

    const { result } = renderHook(() => useStartImpersonation(), { wrapper });

    await expect(
      result.current.mutateAsync({ targeted_tenant_id: "tenant-9" }),
    ).rejects.toMatchObject({ status: 409 });
    expect(h.claimTenant).not.toHaveBeenCalled();
  });

  it("fails when the status cannot be read after the start", async () => {
    h.startImpersonation.mockResolvedValue(cookieReplaced);
    h.impersonationStatus.mockRejectedValue(new TypeError("Failed to fetch"));

    const { result } = renderHook(() => useStartImpersonation(), { wrapper });

    await expect(
      result.current.mutateAsync({ targeted_tenant_id: "tenant-9" }),
    ).rejects.toThrow();
    expect(h.claimTenant).not.toHaveBeenCalled();
  });

  it("refreshes and starts again when the access token had expired", async () => {
    h.startImpersonation
      .mockRejectedValueOnce(expiredAccessToken())
      .mockResolvedValueOnce(cookieReplaced);
    h.impersonationStatus.mockResolvedValue(statusIn("tenant-9"));

    const { result } = renderHook(() => useStartImpersonation(), { wrapper });
    await result.current.mutateAsync({ targeted_tenant_id: "tenant-9" });

    expect(h.refreshWithinSessionLock).toHaveBeenCalledTimes(1);
    expect(h.startImpersonation).toHaveBeenCalledTimes(2);
  });

  it.each([
    ["cookie_set false", { cookie_set: false, access_token: "at" }],
    ["cookie_set absent", { impersonation_mode: true }],
    ["an empty body", undefined],
  ])("treats a 200 with %s as a failed impersonation", async (_label, body) => {
    // The browser authenticates with the HttpOnly cookie and ignores body tokens, so such a
    // response leaves the previous cookie -- root, or the previous project -- in place. Recording
    // "impersonated" for it made the client render a project it had never entered.
    h.startImpersonation.mockResolvedValue(body);

    const { result } = renderHook(() => useStartImpersonation(), { wrapper });
    await expect(
      result.current.mutateAsync({ targeted_tenant_id: "tenant-9" }),
    ).rejects.toThrow();

    expect(h.claimTenant).not.toHaveBeenCalled();
    const status = client.getQueryData<{ impersonated: boolean }>(STATUS_KEY);
    expect(status?.impersonated).not.toBe(true);
  });
});

describe("useSessionTenantGuard", () => {
  let registered: SessionTenantGuard | null;
  let setSessionGuard: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    registered = null;
    setSessionGuard = vi
      .spyOn(HttpClient, "setSessionGuard")
      .mockImplementation((guard: SessionTenantGuard) => {
        registered = guard;
        return () => {
          registered = null;
        };
      });
  });

  afterEach(() => setSessionGuard.mockRestore());

  it("expects the tenant the guards are rendering", () => {
    renderHook(() => useSessionTenantGuard(), { wrapper });

    expect(registered?.expectedTenant()).toBeNull();

    useImpersonateStore.getState().setImpersonation(true, ROOT, "t1");
    useImpersonateStore.getState().setInitialized(true);
    expect(registered?.expectedTenant()).toBe("t1");

    // Root is the app's own tenant key, wherever the runtime configuration provides it.
    useImpersonateStore.getState().setImpersonation(false, ROOT, null);
    expect(registered?.expectedTenant()).toBe(
      getRuntimeEnv("BLOCKS_X_BLOCKS_KEY"),
    );
  });

  it("confirms the tenant with the server without refreshing, and records the answer", async () => {
    h.impersonationStatus.mockResolvedValue(statusIn("t2"));
    renderHook(() => useSessionTenantGuard(), { wrapper });

    await expect(registered?.confirmTenant()).resolves.toBe("t2");

    expect(h.impersonationStatus).toHaveBeenCalledWith(insideLock);
    expect(client.getQueryData(STATUS_KEY)).toEqual(statusIn("t2"));
  });

  it("drops data cached for the tenant the page was showing when the session turns out elsewhere", async () => {
    useImpersonateStore.getState().setImpersonation(true, ROOT, "t1");
    useImpersonateStore.getState().setInitialized(true);
    client.setQueryData(["repos-list"], ["a repo of t1"]);
    h.impersonationStatus.mockResolvedValue(statusIn("t2"));
    renderHook(() => useSessionTenantGuard(), { wrapper });

    await registered?.confirmTenant();

    await waitFor(() =>
      expect(client.getQueryData(["repos-list"])).toBeUndefined(),
    );
    expect(client.getQueryData(STATUS_KEY)).toEqual(statusIn("t2"));
  });

  it("keeps cached data while the session is where the page expects", async () => {
    useImpersonateStore.getState().setImpersonation(true, ROOT, "t1");
    useImpersonateStore.getState().setInitialized(true);
    client.setQueryData(["repos-list"], ["a repo of t1"]);
    h.impersonationStatus.mockResolvedValue(statusIn("t1"));
    renderHook(() => useSessionTenantGuard(), { wrapper });

    await registered?.confirmTenant();
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(client.getQueryData(["repos-list"])).toEqual(["a repo of t1"]);
  });

  it("unregisters on unmount", () => {
    const { unmount } = renderHook(() => useSessionTenantGuard(), { wrapper });
    expect(registered).not.toBeNull();

    unmount();

    expect(registered).toBeNull();
  });
});

describe("useStatusFirstOnTabReturn", () => {
  let visibility: DocumentVisibilityState;

  beforeEach(() => {
    visibility = "visible";
    vi.spyOn(document, "visibilityState", "get").mockImplementation(
      () => visibility,
    );
  });

  afterEach(() => vi.restoreAllMocks());

  it("asks where the session is before refetching anything else", async () => {
    let answer: (status: unknown) => void = () => undefined;
    h.impersonationStatus.mockReturnValue(
      new Promise((resolve) => {
        answer = resolve;
      }),
    );
    const reposList = vi.fn().mockResolvedValue(["a repo"]);

    renderHook(
      () => {
        useStatusFirstOnTabReturn();
        return useQuery({
          queryKey: ["repos-list"],
          queryFn: reposList,
          staleTime: 0,
        });
      },
      { wrapper },
    );
    await waitFor(() => expect(reposList).toHaveBeenCalledTimes(1));

    act(() => {
      window.dispatchEvent(new Event("visibilitychange"));
    });

    expect(h.impersonationStatus).toHaveBeenCalledWith({
      skipSessionCheck: true,
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
    // Sent now, it would carry whatever tenant another tab left in the cookie.
    expect(reposList).toHaveBeenCalledTimes(1);

    await act(async () => {
      answer(statusIn(null));
    });

    await waitFor(() => expect(reposList).toHaveBeenCalledTimes(2));
    expect(client.getQueryData(STATUS_KEY)).toEqual(statusIn(null));
  });

  it("still refetches when the status cannot be read", async () => {
    h.impersonationStatus.mockRejectedValue(new TypeError("Failed to fetch"));
    const reposList = vi.fn().mockResolvedValue(["a repo"]);

    renderHook(
      () => {
        useStatusFirstOnTabReturn();
        return useQuery({
          queryKey: ["repos-list"],
          queryFn: reposList,
          staleTime: 0,
        });
      },
      { wrapper },
    );
    await waitFor(() => expect(reposList).toHaveBeenCalledTimes(1));

    act(() => {
      window.dispatchEvent(new Event("visibilitychange"));
    });

    await waitFor(() => expect(reposList).toHaveBeenCalledTimes(2));
  });
});

describe("useRecordClaimedTenant", () => {
  it("records another tab's project claim as impersonated", () => {
    const { result } = renderHook(() => useRecordClaimedTenant(), { wrapper });

    result.current("t1", "root");

    expect(client.getQueryData(STATUS_KEY)).toEqual({
      impersonated: true,
      originalTenantId: "root",
      impersonatedTenantId: "t1",
    });
  });

  it("records another tab's console claim as stopped", () => {
    client.setQueryData(STATUS_KEY, {
      impersonated: true,
      originalTenantId: "root",
      impersonatedTenantId: "t1",
    });
    const { result } = renderHook(() => useRecordClaimedTenant(), { wrapper });

    result.current("root", "root");

    expect(client.getQueryData(STATUS_KEY)).toMatchObject({
      impersonated: false,
      impersonatedTenantId: null,
    });
  });
});
