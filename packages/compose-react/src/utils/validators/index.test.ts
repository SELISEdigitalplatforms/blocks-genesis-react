import { describe, it, expect } from "vitest";
import {
  isEmail,
  isUrl,
  isUuid,
  isPhone,
  isCreditCard,
  isPostalCode,
  isValidDate,
  createSchema,
  string,
  number,
  boolean,
} from "@/utils/validators";

describe("isEmail", () => {
  it("accepts a well-formed address", () => expect(isEmail("a@b.co")).toBe(true));
  it("rejects an address without a domain dot", () =>
    expect(isEmail("a@b")).toBe(false));
});

describe("isUrl", () => {
  it("accepts a valid URL", () => expect(isUrl("https://x.com")).toBe(true));
  it("rejects an invalid URL", () => expect(isUrl("not a url")).toBe(false));
});

describe("isUuid", () => {
  it("accepts a uuid-shaped value", () =>
    expect(isUuid("123e4567-e89b-12d3-a456-426614174000")).toBe(true));
  it("rejects a non-uuid", () => expect(isUuid("nope")).toBe(false));
});

describe("isPhone", () => {
  it("accepts an E.164 number", () =>
    expect(isPhone("+14155552671")).toBe(true));
  it("rejects a local-format number", () =>
    expect(isPhone("4155552671")).toBe(false));
});

describe("isCreditCard", () => {
  it("accepts a Luhn-valid number", () =>
    expect(isCreditCard("4111111111111111")).toBe(true));
  it("rejects a too-short number", () =>
    expect(isCreditCard("123")).toBe(false));
  it("rejects a Luhn-invalid number", () =>
    expect(isCreditCard("4111111111111112")).toBe(false));
});

describe("isPostalCode", () => {
  it("validates US codes by default", () =>
    expect(isPostalCode("12345")).toBe(true));
  it("validates UK codes", () =>
    expect(isPostalCode("SW1A 1AA", "UK")).toBe(true));
  it("validates CA codes", () =>
    expect(isPostalCode("K1A 0B1", "CA")).toBe(true));
  it("rejects an unmatched code", () =>
    expect(isPostalCode("abc", "US")).toBe(false));
});

describe("isValidDate", () => {
  it("accepts a modern date", () =>
    expect(isValidDate("2020-01-01")).toBe(true));
  it("rejects an unparseable date", () =>
    expect(isValidDate("not-a-date")).toBe(false));
  it("rejects a date before 1900", () =>
    expect(isValidDate("1800-01-01")).toBe(false));
});

describe("createSchema", () => {
  const schema = createSchema({ name: string(), age: number() });

  it("validates a conforming object", () => {
    expect(schema({ name: "a", age: 1 })).toEqual({
      success: true,
      data: { name: "a", age: 1 },
    });
  });

  it("reports a failing field", () => {
    expect(schema({ name: 1, age: 1 }).success).toBe(false);
  });

  it("rejects non-object input", () => {
    expect(schema("x").success).toBe(false);
  });
});

describe("primitive validators", () => {
  it("string accepts strings and rejects others", () => {
    expect(string()("a").success).toBe(true);
    expect(string()(1).success).toBe(false);
  });

  it("number accepts finite numbers and rejects NaN", () => {
    expect(number()(1).success).toBe(true);
    expect(number()(NaN).success).toBe(false);
  });

  it("boolean accepts booleans and rejects others", () => {
    expect(boolean()(true).success).toBe(true);
    expect(boolean()(1).success).toBe(false);
  });
});
