import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpError } from "@/lib/http/error";
import {
  useImpersonationStatusChecker,
  useStartImpersonation,
  useStopImpersonation,
} from "./use-impersonation";

const h = vi.hoisted(() => ({
  impersonationStatus: vi.fn(),
  stopImpersonation: vi.fn(),
  startImpersonation: vi.fn(),
  claimTenant: vi.fn(),
}));

vi.mock("@/services/impersonation.service", () => ({
  impersonationService: {
    impersonationStatus: h.impersonationStatus,
    stopImpersonation: h.stopImpersonation,
    startImpersonation: h.startImpersonation,
  },
}));

vi.mock("@/lib/tenant-ownership", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/tenant-ownership")>()),
  claimTenant: h.claimTenant,
}));

/** IAM's success shape: the cookie was replaced, so the browser is now on the target tenant. */
const cookieReplaced = { cookie_set: true, impersonation_mode: true };

const STATUS_KEY = ["blocks-kit-impersonation", "status"];

let client: QueryClient;
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

describe("use-impersonation hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("fetches the current impersonation status", async () => {
    h.impersonationStatus.mockResolvedValue({
      impersonated: true,
      originalTenantId: "orig",
      impersonatedTenantId: "imp",
    });

    const { result } = renderHook(() => useImpersonationStatusChecker(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.impersonatedTenantId).toBe("imp");
  });

  it("resets the cached status to stopped after stopping impersonation", async () => {
    h.stopImpersonation.mockResolvedValue(undefined);

    const { result } = renderHook(() => useStopImpersonation(), { wrapper });
    await result.current.mutateAsync(undefined);

    await waitFor(() => {
      const status = client.getQueryData<{ impersonated: boolean }>(STATUS_KEY);
      expect(status?.impersonated).toBe(false);
    });
  });

  it("leaves the cached status alone when a stop fails for any reason but 401", async () => {
    // A stop that 500s or never leaves the browser leaves the session impersonated server-side.
    // Recording "stopped" there put the client into a state the server did not share.
    client.setQueryData(STATUS_KEY, {
      impersonated: true,
      originalTenantId: "orig",
      impersonatedTenantId: "imp",
    });
    h.stopImpersonation.mockRejectedValue(new HttpError(500, { errors: {} }));

    const { result } = renderHook(() => useStopImpersonation(), { wrapper });
    await expect(result.current.mutateAsync(undefined)).rejects.toThrow();

    const status = client.getQueryData<{ impersonated: boolean }>(STATUS_KEY);
    expect(status?.impersonated).toBe(true);
  });

  it("records stopped when a stop 401s, because no live impersonated session remains", async () => {
    client.setQueryData(STATUS_KEY, {
      impersonated: true,
      originalTenantId: "orig",
      impersonatedTenantId: "imp",
    });
    h.stopImpersonation.mockRejectedValue(new HttpError(401, { errors: {} }));

    const { result } = renderHook(() => useStopImpersonation(), { wrapper });
    await expect(result.current.mutateAsync(undefined)).rejects.toThrow();

    await waitFor(() => {
      const status = client.getQueryData<{ impersonated: boolean }>(STATUS_KEY);
      expect(status?.impersonated).toBe(false);
    });
  });

  it("writes the impersonated tenant into the cache on start", async () => {
    h.startImpersonation.mockResolvedValue(cookieReplaced);

    const { result } = renderHook(() => useStartImpersonation(), { wrapper });
    await result.current.mutateAsync({ targeted_tenant_id: "tenant-9" });

    await waitFor(() => {
      const status = client.getQueryData<{
        impersonated: boolean;
        impersonatedTenantId: string;
      }>(STATUS_KEY);
      expect(status?.impersonated).toBe(true);
      expect(status?.impersonatedTenantId).toBe("tenant-9");
    });
  });

  it("claims the cookie for the other tabs on start", async () => {
    // Every entry path claims, not just the route guard: the environment cards call this hook
    // directly, and they are the main way into a project.
    h.startImpersonation.mockResolvedValue(cookieReplaced);

    const { result } = renderHook(() => useStartImpersonation(), { wrapper });
    await result.current.mutateAsync({ targeted_tenant_id: "tenant-9" });

    await waitFor(() => expect(h.claimTenant).toHaveBeenCalledWith("tenant-9"));
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
