import { describe, it, expect } from "vitest";
import { formatDuration, formatSeconds } from "@/utils/time";

describe("formatDuration", () => {
  it("returns 0s for a zero duration", () => {
    expect(formatDuration(0)).toBe("0s");
  });

  it("formats milliseconds down to the two largest non-zero units", () => {
    expect(formatDuration(90000)).toBe("1m 30s");
  });

  it("includes days and hours for large durations", () => {
    expect(formatDuration(200000000)).toBe("2d 7h");
  });

  it("accepts seconds as the input unit", () => {
    expect(formatDuration(90, "s")).toBe("1m 30s");
  });
});

describe("formatSeconds", () => {
  it("formats sub-minute values in seconds", () => {
    expect(formatSeconds(45)).toBe("45s");
  });

  it("formats sub-hour values in minutes", () => {
    expect(formatSeconds(120)).toBe("2min");
  });

  it("formats sub-day values in hours", () => {
    expect(formatSeconds(7200)).toBe("2h");
  });

  it("formats day-scale values in days", () => {
    expect(formatSeconds(172800)).toBe("2d");
  });
});
