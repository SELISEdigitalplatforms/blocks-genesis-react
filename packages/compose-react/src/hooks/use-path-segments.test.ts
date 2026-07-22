import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  getPathSegments,
  usePathSegments,
  defaultPathSegmentFormatter,
} from "@/hooks/use-path-segments";

describe("path segments", () => {
  it("formats kebab-case segments to title case", () => {
    expect(defaultPathSegmentFormatter("create-project")).toBe(
      "Create Project",
    );
  });

  it("splits a pathname into cumulative segments", () => {
    const segments = getPathSegments("/projects/my-app/settings");
    expect(segments).toHaveLength(3);
    expect(segments[1]).toMatchObject({
      href: "/projects/my-app",
      segment: "my-app",
      label: "My App",
      index: 1,
    });
  });

  it("supports a custom formatter", () => {
    const segments = getPathSegments("/a/b", {
      formatter: (s) => s.toUpperCase(),
    });
    expect(segments[0].label).toBe("A");
  });

  it("usePathSegments returns the parsed segments", () => {
    const { result } = renderHook(() => usePathSegments("/x/y"));
    expect(result.current).toHaveLength(2);
  });
});
