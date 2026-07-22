import { describe, it, expect } from "vitest";
import { formatFileSize, formatBytes } from "@/utils/file";

describe("formatFileSize", () => {
  it("keeps small byte values in bytes", () => {
    expect(formatFileSize(512, "B")).toBe("512 B");
  });

  it("promotes to the next larger unit", () => {
    expect(formatFileSize(1536, "B")).toBe("1.5 KB");
  });

  it("scales from a non-byte input unit", () => {
    expect(formatFileSize(1, "GB")).toBe("1 GB");
  });

  it("respects the decimals argument", () => {
    expect(formatFileSize(1536, "B", 0)).toBe("2 KB");
  });
});

describe("formatBytes", () => {
  it("returns 0 B for zero", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("formats megabytes", () => {
    expect(formatBytes(1024 ** 2)).toBe("1 MB");
  });

  it("clamps to the largest known unit", () => {
    expect(formatBytes(1024 ** 5)).toContain("TB");
  });
});
