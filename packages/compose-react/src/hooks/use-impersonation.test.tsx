import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  useImpersonationStatusChecker,
  useStartImpersonation,
  useStopImpersonation,
} from "./use-impersonation";

const h = vi.hoisted(() => ({
  impersonationStatus: vi.fn(),
  stopImpersonation: vi.fn(),
  startImpersonation: vi.fn(),
}));

vi.mock("@/services/impersonation.service", () => ({
  impersonationService: {
    impersonationStatus: h.impersonationStatus,
    stopImpersonation: h.stopImpersonation,
    startImpersonation: h.startImpersonation,
  },
}));

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

  it("writes the impersonated tenant into the cache on start", async () => {
    h.startImpersonation.mockResolvedValue(undefined);

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
});
