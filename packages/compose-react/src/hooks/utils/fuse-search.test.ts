import { describe, it, expect } from "vitest";
import {
  defaultFuseSearchOptions,
  createFuseSearcher,
  fuseFilter,
  fuseSearch,
  fuseSearchWithIndex,
} from "@/hooks/utils/fuse-search";

const rows = [{ name: "apple" }, { name: "banana" }, { name: "cherry" }];
const options = { ...defaultFuseSearchOptions<(typeof rows)[number]>(), keys: ["name"] };

describe("fuse-search", () => {
  it("provides sensible default options", () => {
    const opts = defaultFuseSearchOptions();
    expect(opts.threshold).toBeGreaterThan(0);
    expect(opts.ignoreLocation).toBe(true);
  });

  it("fuseFilter returns all rows on a blank query and matches otherwise", () => {
    expect(fuseFilter(rows, "  ", options)).toHaveLength(3);
    expect(
      fuseFilter(rows, "appl", options).some((r) => r.name === "apple"),
    ).toBe(true);
  });

  it("fuseSearch returns metadata and all rows on a blank query", () => {
    const all = fuseSearch(rows, "", options);
    expect(all).toHaveLength(3);
    expect(all[0]).toHaveProperty("refIndex", 0);
    expect(fuseSearch(rows, "banana", options)[0].item.name).toBe("banana");
  });

  it("fuseSearchWithIndex reuses a prebuilt index", () => {
    const fuse = createFuseSearcher(rows, options);
    expect(fuseSearchWithIndex(fuse, rows, "  ")).toHaveLength(3);
    expect(
      fuseSearchWithIndex(fuse, rows, "cher").some((r) => r.name === "cherry"),
    ).toBe(true);
  });
});
