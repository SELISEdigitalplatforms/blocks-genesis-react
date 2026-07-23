import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ServiceName } from "@/store";
import { useSwaggerEndpoints } from "./use-swagger-endpoints";

const h = vi.hoisted(() => ({
  getServiceBaseUrl: vi.fn(),
  getServiceSwaggerUrl: vi.fn(),
}));

vi.mock("@/utils", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/utils")>()),
  getServiceBaseUrl: h.getServiceBaseUrl,
  getServiceSwaggerUrl: h.getServiceSwaggerUrl,
}));

let client: QueryClient;
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

describe("useSwaggerEndpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("returns no endpoints and does not fetch without a service name", () => {
    const fetchSpy = vi.stubGlobal("fetch", vi.fn());

    const { result } = renderHook(() => useSwaggerEndpoints(undefined), {
      wrapper,
    });

    expect(result.current.endpoints).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    void fetchSpy;
  });

  it("parses the fetched swagger document into endpoints", async () => {
    h.getServiceBaseUrl.mockReturnValue("https://svc.test");
    h.getServiceSwaggerUrl.mockReturnValue("https://svc.test/swagger.json");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            paths: {
              "/users": { get: { summary: "List Users", tags: ["Iam"] } },
            },
          }),
      }),
    );

    const { result } = renderHook(
      () => useSwaggerEndpoints("iam" as ServiceName),
      { wrapper },
    );

    await waitFor(() => expect(result.current.endpoints).toHaveLength(1));
    expect(result.current.endpoints[0]).toMatchObject({
      method: "GET",
      summary: "List Users",
      tag: "Iam",
    });
  });

  it("reports an error when the swagger fetch fails", async () => {
    h.getServiceSwaggerUrl.mockReturnValue("https://svc.test/swagger.json");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    const { result } = renderHook(
      () => useSwaggerEndpoints("iam" as ServiceName),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
