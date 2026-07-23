import { describe, it, expect } from "vitest";
import { formatFullDate, formatDate, compareDates } from "@/utils/date";

describe("formatFullDate", () => {
  it("formats with time by default", () => {
    expect(formatFullDate(new Date(2020, 0, 5, 9, 7))).toBe(
      "Jan 05, 2020 at 09:07",
    );
  });

  it("omits the time when requested", () => {
    expect(formatFullDate(new Date(2020, 0, 5, 9, 7), true)).toBe(
      "Jan 05, 2020",
    );
  });
});

describe("formatDate", () => {
  it("uses Intl formatting by default", () => {
    expect(formatDate("2020-01-05", undefined, "en-US")).toContain("2020");
  });

  it("uses legacy dd/mm/yyyy with time when passed false", () => {
    expect(formatDate(new Date(2020, 0, 5, 9, 7), false)).toBe(
      "05/01/2020, 09:07",
    );
  });

  it("omits the time in legacy mode when passed true", () => {
    expect(formatDate(new Date(2020, 0, 5, 9, 7), true)).toBe("05/01/2020");
  });
});

describe("compareDates", () => {
  it("returns negative when the first date is earlier", () => {
    expect(compareDates("2020-01-01", "2020-01-02")).toBeLessThan(0);
  });

  it("returns zero for equal dates", () => {
    expect(compareDates("2020-01-01", "2020-01-01")).toBe(0);
  });
});
