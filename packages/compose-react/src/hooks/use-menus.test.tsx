import { describe, it, expect } from "vitest";
import type { ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useIsActiveMenu, useFilteredMenus } from "@/hooks/use-menus";

const wrapper =
  (entries: string[]) =>
  ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={entries}>{children}</MemoryRouter>
  );

describe("useIsActiveMenu", () => {
  it("marks a path active when the location starts with it", () => {
    const { result } = renderHook(() => useIsActiveMenu("/app"), {
      wrapper: wrapper(["/app/console"]),
    });
    expect(result.current.isActivePath).toBe(true);
    expect(result.current.checkIsActivePath("/other")).toBe(false);
  });

  it("marks a path inactive when the location does not start with it", () => {
    const { result } = renderHook(() => useIsActiveMenu("/app/project"), {
      wrapper: wrapper(["/app/console"]),
    });
    expect(result.current.isActivePath).toBe(false);
  });
});

describe("useFilteredMenus", () => {
  const menus = [
    { id: "console", type: "menu", name: "Console", path: "/app/console" },
    { id: "settings", type: "menu", name: "Settings", path: "/settings" },
    { id: "off", type: "menu", name: "Off", path: "/off", disabled: true },
  ];

  it("hides project-overview-only and disabled menus outside project routes", () => {
    const { result } = renderHook(() => useFilteredMenus(menus as never), {
      wrapper: wrapper(["/app/console"]),
    });
    const ids = result.current.map((m) => m.id);
    expect(ids).toContain("console");
    expect(ids).not.toContain("settings");
    expect(ids).not.toContain("off");
  });

  it("shows project-overview menus and hides others inside project routes", () => {
    const { result } = renderHook(() => useFilteredMenus(menus as never), {
      wrapper: wrapper(["/app/project/tg1"]),
    });
    const ids = result.current.map((m) => m.id);
    expect(ids).toContain("settings");
    expect(ids).not.toContain("console");
  });

  it("keeps a separator between two visible menus", () => {
    const withSeparator = [
      { id: "a", type: "menu", name: "A", path: "/a" },
      { id: "separator-1", type: "separator" },
      { id: "b", type: "menu", name: "B", path: "/b" },
    ];
    const { result } = renderHook(
      () => useFilteredMenus(withSeparator as never),
      { wrapper: wrapper(["/a"]) },
    );
    expect(result.current.map((m) => m.id)).toEqual([
      "a",
      "separator-1",
      "b",
    ]);
  });
});
