import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useQueryClientKit } from "./use-query-client-kit";

let client: QueryClient;

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

const renderKit = () =>
  renderHook(() => useQueryClientKit(), { wrapper }).result;

const key = ["notifications"] as never;
const filters = { exact: true } as never;
const options = { cancelRefetch: false } as never;

describe("useQueryClientKit", () => {
  beforeEach(() => {
    client = new QueryClient();
  });

  it("returns the raw TanStack client", () => {
    const { current } = renderKit();
    expect(current.client).toBe(client);
  });

  it("invalidate merges the query key into the filters", () => {
    const spy = vi.spyOn(client, "invalidateQueries").mockResolvedValue();
    const { current } = renderKit();

    current.invalidate(key, filters, options);

    expect(spy).toHaveBeenCalledWith({ exact: true, queryKey: key }, options);
  });

  it("invalidateMany invalidates every provided key", async () => {
    const spy = vi.spyOn(client, "invalidateQueries").mockResolvedValue();
    const { current } = renderKit();

    await current.invalidateMany([["a"], ["b"]] as never, filters, options);

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("cancel, refetch, remove and reset delegate to the client", () => {
    const cancel = vi.spyOn(client, "cancelQueries").mockResolvedValue();
    const refetch = vi.spyOn(client, "refetchQueries").mockResolvedValue();
    const remove = vi.spyOn(client, "removeQueries").mockReturnValue();
    const reset = vi.spyOn(client, "resetQueries").mockResolvedValue();
    const { current } = renderKit();

    current.cancel(key, filters, options);
    current.refetch(key, filters, options);
    current.remove(key, filters);
    current.reset(key, filters, options);

    expect(cancel).toHaveBeenCalledWith(
      { exact: true, queryKey: key },
      options,
    );
    expect(refetch).toHaveBeenCalledWith(
      { exact: true, queryKey: key },
      options,
    );
    expect(remove).toHaveBeenCalledWith({ exact: true, queryKey: key });
    expect(reset).toHaveBeenCalledWith({ exact: true, queryKey: key }, options);
  });

  it("round-trips cached data via getData and setData", () => {
    const { current } = renderKit();

    current.setData(["count"] as never, 7);

    expect(current.getData(["count"] as never)).toBe(7);
  });

  it("getQueriesData and setQueriesData delegate with merged filters", () => {
    const get = vi.spyOn(client, "getQueriesData");
    const set = vi.spyOn(client, "setQueriesData");
    const { current } = renderKit();

    current.getQueriesData(key, filters);
    current.setQueriesData(key, () => 1, filters);

    expect(get).toHaveBeenCalledWith({ exact: true, queryKey: key });
    expect(set).toHaveBeenCalledWith(
      { exact: true, queryKey: key },
      expect.any(Function),
    );
  });

  it("fetch and ensure forward the query key and function", async () => {
    const fetchSpy = vi
      .spyOn(client, "fetchQuery")
      .mockResolvedValue("fetched");
    const ensureSpy = vi
      .spyOn(client, "ensureQueryData")
      .mockResolvedValue("ensured");
    const queryFn = vi.fn();
    const { current } = renderKit();

    await current.fetch(key, queryFn);
    await current.ensure(key, queryFn);

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: key, queryFn }),
    );
    expect(ensureSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: key, queryFn }),
    );
  });
});
