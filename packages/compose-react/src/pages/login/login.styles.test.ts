import { describe, it, expect } from "vitest";
import { blocksLoginStyles } from "@/pages/login/login.styles";

describe("blocksLoginStyles", () => {
  it("is a non-empty CSS string scoped to the login page", () => {
    expect(typeof blocksLoginStyles).toBe("string");
    expect(blocksLoginStyles.length).toBeGreaterThan(0);
    expect(blocksLoginStyles).toContain(".blocksLogin-page");
  });
});
