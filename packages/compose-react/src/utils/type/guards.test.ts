import { describe, it, expect } from "vitest";
import {
  isString,
  isNumber,
  isBoolean,
  isNullish,
  isObject,
  isPlainObject,
  isPromise,
} from "@/utils/type/guards";

describe("type guards", () => {
  it("isString distinguishes strings", () => {
    expect(isString("x")).toBe(true);
    expect(isString(1)).toBe(false);
  });

  it("isNumber rejects NaN and non-numbers", () => {
    expect(isNumber(1)).toBe(true);
    expect(isNumber(NaN)).toBe(false);
    expect(isNumber("1")).toBe(false);
  });

  it("isBoolean distinguishes booleans", () => {
    expect(isBoolean(true)).toBe(true);
    expect(isBoolean(0)).toBe(false);
  });

  it("isNullish matches null and undefined only", () => {
    expect(isNullish(null)).toBe(true);
    expect(isNullish(undefined)).toBe(true);
    expect(isNullish(0)).toBe(false);
  });

  it("isObject rejects arrays and null", () => {
    expect(isObject({})).toBe(true);
    expect(isObject([])).toBe(false);
    expect(isObject(null)).toBe(false);
  });

  it("isPlainObject accepts literals and null-prototype objects", () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject(Object.create(null))).toBe(true);
    expect(isPlainObject(new Date())).toBe(false);
    expect(isPlainObject([])).toBe(false);
  });

  it("isPromise detects thenable/catchable values", () => {
    expect(isPromise(Promise.resolve())).toBe(true);
    expect(isPromise({ then() {}, catch() {} })).toBe(true);
    expect(isPromise({})).toBe(false);
  });
});
