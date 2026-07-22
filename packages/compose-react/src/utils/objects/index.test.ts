import { describe, it, expect } from "vitest";
import { deepMerge, deepClone, pick, omit } from "@/utils/objects";

describe("deepMerge", () => {
  it("merges nested objects recursively", () => {
    const result = deepMerge({ a: { b: 1 } }, { a: { c: 2 } });
    expect(result).toEqual({ a: { b: 1, c: 2 } });
  });

  it("adds nested keys missing from the target", () => {
    const result = deepMerge({ a: 1 } as Record<string, unknown>, {
      b: { c: 2 },
    });
    expect(result).toEqual({ a: 1, b: { c: 2 } });
  });

  it("overwrites primitive values from the source", () => {
    expect(deepMerge({ a: 1 }, { a: 2 })).toEqual({ a: 2 });
  });

  it("returns a copy when the source is not an object", () => {
    const target = { a: 1 };
    const result = deepMerge(target, null);
    expect(result).toEqual({ a: 1 });
    expect(result).not.toBe(target);
  });
});

describe("deepClone", () => {
  it("clones deeply so nested mutations do not leak", () => {
    const original = { a: { b: 1 } };
    const clone = deepClone(original);
    clone.a.b = 99;
    expect(original.a.b).toBe(1);
  });

  it("falls back to JSON cloning when structuredClone is unavailable", () => {
    const original = globalThis.structuredClone;
    // @ts-expect-error force the fallback branch
    globalThis.structuredClone = undefined;
    try {
      expect(deepClone({ a: 1 })).toEqual({ a: 1 });
    } finally {
      globalThis.structuredClone = original;
    }
  });
});

describe("pick", () => {
  it("keeps only the selected keys", () => {
    expect(pick({ a: 1, b: 2, c: 3 }, ["a", "c"])).toEqual({ a: 1, c: 3 });
  });

  it("ignores keys not present on the object", () => {
    expect(pick({ a: 1 } as { a: number; b?: number }, ["b"])).toEqual({});
  });
});

describe("omit", () => {
  it("removes the selected keys", () => {
    expect(omit({ a: 1, b: 2, c: 3 }, ["b"])).toEqual({ a: 1, c: 3 });
  });
});
