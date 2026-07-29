import { act, renderHook } from "@testing-library/react";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { useSortQueryParams } from "./use-sort-query-params";

const wrapper = ({ children }: { children: ReactNode }) => (
  <NuqsTestingAdapter>{children}</NuqsTestingAdapter>
);

describe("useSortQueryParams", () => {
  it("defaults to the provided initial sort values", () => {
    const { result } = renderHook(
      () =>
        useSortQueryParams({
          initial: { property: "name", isDescending: true },
        }),
      { wrapper },
    );

    expect(result.current.sortQueryParams).toEqual({
      property: "name",
      isDescending: true,
    });
  });

  it("updates the sort query params", () => {
    const { result } = renderHook(() => useSortQueryParams({}), { wrapper });

    act(() =>
      result.current.setSortQueryParams({
        property: "date",
        isDescending: true,
      }),
    );

    expect(result.current.sortQueryParams).toEqual({
      property: "date",
      isDescending: true,
    });
  });

  it("resets back to the defaults", () => {
    const { result } = renderHook(() => useSortQueryParams({}), { wrapper });

    act(() =>
      result.current.setSortQueryParams({
        property: "date",
        isDescending: true,
      }),
    );
    act(() => result.current.reset());

    expect(result.current.sortQueryParams).toEqual({
      property: "",
      isDescending: false,
    });
  });
});
