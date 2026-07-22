import { describe, it, expect } from "vitest";
import type { ReactNode } from "react";
import { renderHook, act } from "@testing-library/react";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { parseAsInteger, parseAsString } from "nuqs";
import { useQueryStatesKit } from "@/hooks/query-state/use-query-states-kit";

const schema = {
  q: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
};

const setup = (searchParams = "") => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <NuqsTestingAdapter searchParams={searchParams}>
      {children}
    </NuqsTestingAdapter>
  );
  return renderHook(
    () => useQueryStatesKit({ schema, defaults: { page: 1 } }),
    { wrapper },
  );
};

describe("useQueryStatesKit", () => {
  it("exposes parsed defaults", () => {
    const { result } = setup();
    expect(result.current.query.q).toBe("");
    expect(result.current.query.page).toBe(1);
  });

  it("patches values via object and updater forms of setQuery", async () => {
    const { result } = setup();
    await act(async () => {
      await result.current.setQuery({ q: "hello" });
    });
    expect(result.current.query.q).toBe("hello");
    await act(async () => {
      await result.current.setQuery((prev) => ({ q: `${prev.q}!` }));
    });
    expect(result.current.query.q).toBe("hello!");
  });

  it("restores defaults with resetQuery for all and selected keys", async () => {
    const { result } = setup("?q=abc&page=5");
    await act(async () => {
      await result.current.resetQuery();
    });
    expect(result.current.query.page).toBe(1);
    await act(async () => {
      await result.current.setQuery({ q: "x" });
    });
    await act(async () => {
      await result.current.resetQuery(["q"]);
    });
    expect(result.current.query.q).toBe("");
  });

  it("clears all or selected keys with clearQuery", async () => {
    const { result } = setup("?q=abc");
    await act(async () => {
      await result.current.clearQuery(["q"]);
    });
    expect(result.current.query.q).toBe("");
    await act(async () => {
      await result.current.clearQuery();
    });
    expect(result.current.query.q).toBe("");
  });

  it("manages the page key with setPage and resetPage", async () => {
    const { result } = setup();
    await act(async () => {
      await result.current.setPage(4);
    });
    expect(result.current.query.page).toBe(4);
    await act(async () => {
      await result.current.resetPage();
    });
    expect(result.current.query.page).toBe(1);
  });

  it("patches and resets the page with updateAndResetPage", async () => {
    const { result } = setup("?page=7");
    await act(async () => {
      await result.current.updateAndResetPage({ q: "z" });
    });
    expect(result.current.query.q).toBe("z");
    expect(result.current.query.page).toBe(1);
    await act(async () => {
      await result.current.updateAndResetPage((prev) => ({ q: `${prev.q}1` }));
    });
    expect(result.current.query.q).toBe("z1");
    await act(async () => {
      await result.current.updateAndResetPage(() => null);
    });
    expect(result.current.query.page).toBe(1);
  });
});
