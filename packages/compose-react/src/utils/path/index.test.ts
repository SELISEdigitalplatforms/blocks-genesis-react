import { describe, it, expect } from "vitest";
import { getForwardedToPath } from "@/utils/path";

describe("getForwardedToPath", () => {
  it("falls back to the console for non-app paths", () => {
    expect(getForwardedToPath("/other")).toBe("/app/console");
  });

  it("returns the console when there is no second segment", () => {
    expect(getForwardedToPath("/app")).toBe("/app/console");
  });

  it("keeps a project id and lands on its dashboard", () => {
    expect(getForwardedToPath("/app/proj123/environments")).toBe(
      "/app/proj123/dashboard",
    );
  });

  it("sends project-overview paths to the console", () => {
    expect(getForwardedToPath("/app/project/tg1/env")).toBe("/app/console");
  });

  it("forwards known static app pages as-is", () => {
    expect(getForwardedToPath("/app/dashboard")).toBe("/app/dashboard");
  });

  it("sends reserved non-static segments to the console", () => {
    expect(getForwardedToPath("/app/data-migration")).toBe("/app/console");
  });

  it("defaults to the current pathname when no argument is given", () => {
    expect(getForwardedToPath()).toBe("/app/console");
  });
});
