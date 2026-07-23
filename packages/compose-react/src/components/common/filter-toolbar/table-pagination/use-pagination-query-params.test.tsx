import { act, renderHook } from "@testing-library/react";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { usePaginationQueryParams } from "./use-pagination-query-params";

const wrapper = ({ children }: { children: ReactNode }) => (
  <NuqsTestingAdapter>{children}</NuqsTestingAdapter>
);

describe("usePaginationQueryParams", () => {
  it("defaults to the provided initial pagination values", () => {
    const { result } = renderHook(
      () => usePaginationQueryParams({ initial: { pageIndex: 2, pageSize: 25 } }),
      { wrapper },
    );

    expect(result.current.paginationQueryParams).toEqual({
      page: 2,
      pageSize: 25,
    });
  });

  it("updates the pagination query params", () => {
    const { result } = renderHook(() => usePaginationQueryParams({}), {
      wrapper,
    });

    act(() =>
      result.current.setPaginationQueryParams({ pageIndex: 3, pageSize: 50 }),
    );

    expect(result.current.paginationQueryParams).toEqual({
      page: 3,
      pageSize: 50,
    });
  });

  it("resets back to the defaults", () => {
    const { result } = renderHook(() => usePaginationQueryParams({}), {
      wrapper,
    });

    act(() =>
      result.current.setPaginationQueryParams({ pageIndex: 3, pageSize: 50 }),
    );
    act(() => result.current.reset());

    expect(result.current.paginationQueryParams).toEqual({
      page: 0,
      pageSize: 10,
    });
  });
});
