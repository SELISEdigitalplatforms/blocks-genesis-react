import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import type { Menu } from "@/types";
import { DashboardRoute } from "./dashboard-route";

vi.mock("./dashboard-layout", () => ({
  DashboardLayout: ({
    navigationMenus,
    forwardedTo,
  }: {
    navigationMenus: Menu[];
    forwardedTo?: string;
  }) => (
    <div
      data-testid="layout"
      data-menus={JSON.stringify(navigationMenus)}
      data-forward={forwardedTo}
    />
  ),
}));

const menus: Menu[] = [
  { id: "1", type: "menu", path: "/app/dashboard" } as Menu,
  { id: "2", type: "menu", path: "/app/project/x" } as Menu,
  { id: "3", type: "separator" } as Menu,
  {
    id: "4",
    type: "menu",
    path: "/app/settings",
    children: [{ id: "5", type: "menu", path: "/app/settings/general" }],
  } as Menu,
];

describe("DashboardRoute", () => {
  it("redirects to the console when the itemId is missing", () => {
    render(
      <MemoryRouter initialEntries={["/app"]}>
        <Routes>
          <Route
            path="/app"
            element={
              <DashboardRoute redirectPaths={{}} navigationMenus={menus} />
            }
          />
          <Route path="/app/console" element={<div>console-page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("console-page")).toBeInTheDocument();
  });

  it("scopes app menu paths with the active itemId, leaving excluded scopes intact", () => {
    render(
      <MemoryRouter initialEntries={["/app/abc/dashboard"]}>
        <Routes>
          <Route
            path="/app/:itemId/*"
            element={
              <DashboardRoute redirectPaths={{}} navigationMenus={menus} />
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    const scoped = JSON.parse(
      screen.getByTestId("layout").getAttribute("data-menus")!,
    ) as Menu[];

    const menuItem = (entry: Menu | undefined) => {
      if (!entry || entry.type !== "menu") {
        throw new Error("expected a menu entry");
      }
      return entry;
    };
    expect(menuItem(scoped[0]).path).toBe("/app/abc/dashboard");
    expect(menuItem(scoped[1]).path).toBe("/app/project/x");
    expect(scoped[2]?.type).toBe("separator");
    expect(menuItem(scoped[3]).path).toBe("/app/abc/settings");
    expect(menuItem(menuItem(scoped[3]).children?.[0]).path).toBe(
      "/app/abc/settings/general",
    );
  });

  it("defaults forwardedTo to the scoped dashboard path", () => {
    render(
      <MemoryRouter initialEntries={["/app/abc/dashboard"]}>
        <Routes>
          <Route
            path="/app/:itemId/*"
            element={
              <DashboardRoute redirectPaths={{}} navigationMenus={menus} />
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("layout")).toHaveAttribute(
      "data-forward",
      "/app/abc/dashboard",
    );
  });
});
