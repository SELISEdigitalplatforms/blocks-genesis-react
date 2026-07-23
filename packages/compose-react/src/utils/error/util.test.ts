import { describe, it, expect } from "vitest";
import {
  isErrorWithErrors,
  hasErrorCode,
  getErrorMessage,
  handleErrorMessages,
} from "@/utils/error/util";

describe("isErrorWithErrors", () => {
  it("accepts an object carrying an errors object", () => {
    expect(isErrorWithErrors({ errors: {} })).toBe(true);
  });

  it("rejects values without an errors object", () => {
    expect(isErrorWithErrors({})).toBe(false);
    expect(isErrorWithErrors(null)).toBe(false);
  });
});

describe("hasErrorCode", () => {
  it("detects a present string code", () => {
    expect(hasErrorCode({ email: "bad" }, "email")).toBe(true);
  });

  it("detects a present array code", () => {
    expect(hasErrorCode({ email: ["bad"] }, "email")).toBe(true);
  });

  it("returns false for a missing code", () => {
    expect(hasErrorCode({}, "email")).toBe(false);
  });

  it("returns false for an empty string value", () => {
    expect(hasErrorCode({ email: "" }, "email")).toBe(false);
  });
});

describe("getErrorMessage", () => {
  it("returns a default when empty", () => {
    expect(getErrorMessage({})).toBe("Something went wrong.");
  });

  it("prefers a mapped message", () => {
    expect(getErrorMessage({ email: "bad" }, { email: "Bad email" })).toEqual([
      "Bad email",
    ]);
  });

  it("joins array values with a comma", () => {
    expect(getErrorMessage({ email: ["a", "b"] })).toEqual(["a, b"]);
  });

  it("collects string values", () => {
    expect(getErrorMessage({ email: "bad" })).toEqual(["bad"]);
  });
});

describe("handleErrorMessages", () => {
  it("passes a string through unchanged", () => {
    expect(handleErrorMessages("boom")).toBe("boom");
  });

  it("delegates object input to getErrorMessage", () => {
    expect(handleErrorMessages({ email: "bad" })).toEqual(["bad"]);
  });

  it("returns a default for unexpected shapes", () => {
    expect(handleErrorMessages(["a"])).toBe("An unexpected error occurred.");
  });
});
