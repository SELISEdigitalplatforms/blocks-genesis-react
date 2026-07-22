import { describe, it, expect } from "vitest";
import { applyColumnFuseFilters } from "@/hooks/use-debounced/util";

const rows = [{ name: "apple" }, { name: "banana" }, { name: "cherry" }];

describe("applyColumnFuseFilters", () => {
  it("returns all rows when the query is blank", () => {
    expect(
      applyColumnFuseFilters(rows, [{ query: "  ", keys: ["name"] }] as never),
    ).toHaveLength(3);
  });

  it("returns all rows when no keys are configured", () => {
    expect(
      applyColumnFuseFilters(rows, [{ query: "apple", keys: [] }] as never),
    ).toHaveLength(3);
  });

  it("fuzzy-filters rows by the query", () => {
    const result = applyColumnFuseFilters(rows, [
      { query: "appl", keys: ["name"] },
    ] as never);
    expect(result.some((r) => r.name === "apple")).toBe(true);
  });
});
