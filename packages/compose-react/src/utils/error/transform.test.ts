import { describe, it, expect } from "vitest";
import { ErrorTransformer } from "@/utils/error/transform";

describe("ErrorTransformer", () => {
  it("returns the fallback for non-object input", () => {
    expect(ErrorTransformer(null)).toEqual({
      non_field_error: "Something went wrong",
    });
  });

  it("returns the fallback when errors is missing", () => {
    expect(ErrorTransformer({})).toEqual({
      non_field_error: "Something went wrong",
    });
  });

  it("maps a string detail to a non-field error", () => {
    expect(ErrorTransformer({ errors: { detail: "boom" } })).toEqual({
      non_field_error: "boom",
    });
  });

  it("returns the errors object when detail is not an array", () => {
    expect(ErrorTransformer({ errors: { email: "bad" } })).toEqual({
      email: "bad",
    });
  });

  it("maps field-required validation entries with a friendly label", () => {
    expect(
      ErrorTransformer({
        errors: { detail: [{ loc: ["body", "email"], msg: "field required" }] },
      }),
    ).toEqual({ email: "Email is required" });
  });

  it("collects bare string entries into non_field_error", () => {
    expect(ErrorTransformer({ errors: { detail: ["a", "b"] } })).toEqual({
      non_field_error: ["a", "b"],
    });
  });

  it("accumulates multiple messages for the same field", () => {
    expect(
      ErrorTransformer({
        errors: {
          detail: [
            { loc: ["body", "email"], msg: "too short" },
            { loc: ["body", "email"], msg: "invalid" },
          ],
        },
      }),
    ).toEqual({ email: ["too short", "invalid"] });
  });

  it("appends further entries onto an existing array of messages", () => {
    expect(ErrorTransformer({ errors: { detail: ["a", "b", "c"] } })).toEqual({
      non_field_error: ["a", "b", "c"],
    });
    expect(
      ErrorTransformer({
        errors: {
          detail: [
            { loc: ["body", "email"], msg: "one" },
            { loc: ["body", "email"], msg: "two" },
            { loc: ["body", "email"], msg: "three" },
          ],
        },
      }),
    ).toEqual({ email: ["one", "two", "three"] });
  });
});
