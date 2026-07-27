import { describe, it, expect } from "vitest";
import type { ReactNode } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/core/tooltip";
import { DesktopMenuItem } from "@/components/core/menus/desktop-menu-item";

const wrap = (ui: ReactNode, entries: string[] = ["/"]) =>
  render(
    <MemoryRouter initialEntries={entries}>
      <TooltipProvider>{ui}</TooltipProvider>
    </MemoryRouter>,
  );

const leaf = { id: "1", type: "menu", name: "Home", path: "/home" };
const parent = {
  id: "2",
  type: "menu",
  name: "Settings",
  path: "/settings",
  children: [
    { id: "3", type: "menu", name: "Profile", path: "/settings/profile" },
  ],
};

describe("DesktopMenuItem", () => {
  it("renders a leaf menu with its name when the sidebar is open", () => {
    wrap(<DesktopMenuItem menu={leaf as never} isSidebarOpen />);
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("renders a leaf menu badge when present", () => {
    wrap(
      <DesktopMenuItem
        menu={{ ...leaf, badge: "New" } as never}
        isSidebarOpen
      />,
    );
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("expands a parent menu on click to reveal its children", () => {
    wrap(<DesktopMenuItem menu={parent as never} isSidebarOpen />);
    expect(screen.getByText("Settings")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Settings/ }));
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("renders a collapsed leaf menu as a link", () => {
    wrap(<DesktopMenuItem menu={leaf as never} isSidebarOpen={false} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/home");
  });
});
