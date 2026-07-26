import { describe, it, expect } from "vitest";
import { groupBy, uniqueBy } from "@/utils/arrays";

describe("groupBy", () => {
  it("groups items by the computed key", () => {
    const items = [
      { t: "a", n: 1 },
      { t: "b", n: 2 },
      { t: "a", n: 3 },
    ];
    expect(groupBy(items, (i) => i.t)).toEqual({
      a: [
        { t: "a", n: 1 },
        { t: "a", n: 3 },
      ],
      b: [{ t: "b", n: 2 }],
    });
  });

  it("returns an empty object for an empty array", () => {
    expect(groupBy([] as number[], (i) => i)).toEqual({});
  });
});

describe("uniqueBy", () => {
  it("keeps the first occurrence of each key", () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 1 }];
    expect(uniqueBy(items, (i) => i.id)).toEqual([{ id: 1 }, { id: 2 }]);
  });
});
