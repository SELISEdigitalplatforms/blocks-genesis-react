import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SidebarContext } from "@/contexts/dashboard-layout";
import { SidebarMenuDesktop } from "./desktop-view";

const h = vi.hoisted(() => ({
  filteredMenus: vi.fn(),
  isActivePath: false,
}));

vi.mock("@/components", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
  DesktopMenuItem: ({ menu }: { menu: { label?: string; id: string } }) => (
    <div data-testid="menu-item">{menu.label ?? menu.id}</div>
  ),
  EnvironmentList: () => <div data-testid="env-list" />,
  Logo: () => <div data-testid="logo" />,
  ProjectList: ({ collapsed }: { collapsed?: boolean }) => (
    <div data-testid="project-list">{String(!!collapsed)}</div>
  ),
  RenderAlternatively: ({
    condition,
    whenTrue,
    whenFalse,
  }: {
    condition: boolean;
    whenTrue: ReactNode;
    whenFalse: ReactNode;
  }) => <>{condition ? whenTrue : whenFalse}</>,
  RenderConditionally: ({
    condition,
    children,
  }: {
    condition: boolean;
    children: ReactNode;
  }) => (condition ? <>{children}</> : null),
  Separator: () => <hr data-testid="separator" />,
}));

vi.mock("@/hooks/use-logo", () => ({
  useLogo: () => ({ appLightLogo: "light.svg", appDarkLogo: "dark.svg" }),
}));
vi.mock("@/hooks/use-icon", () => ({
  useIcon: () => <span data-testid="icon" />,
}));
vi.mock("@/hooks/use-menus", () => ({
  useFilteredMenus: (...args: unknown[]) => h.filteredMenus(...args),
  useIsActiveMenu: () => ({ isActivePath: h.isActivePath }),
}));

const renderDesktop = (isSidebarOpen: boolean, toggleSidebar = vi.fn()) => {
  render(
    <MemoryRouter>
      <SidebarContext.Provider
        value={{ isSidebarOpen, toggleSidebar } as never}
      >
        <SidebarMenuDesktop redirectPaths={{}} navigationMenus={[]} />
      </SidebarContext.Provider>
    </MemoryRouter>,
  );
  return { toggleSidebar };
};

describe("SidebarMenuDesktop", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.isActivePath = false;
    h.filteredMenus.mockReturnValue([
      { id: "m1", type: "menu", label: "Dashboard" },
      { id: "s1", type: "separator" },
    ]);
  });

  it("shows the logo, toggle, and environment list when expanded off a project route", () => {
    renderDesktop(true);

    expect(screen.getByTestId("logo")).toBeInTheDocument();
    expect(screen.getByText("Workspace")).toBeInTheDocument();
    expect(screen.getByTestId("env-list")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("project-list")).toHaveTextContent("false");
  });

  it("shows the icon and collapsed project list when collapsed", () => {
    renderDesktop(false);

    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.queryByTestId("logo")).not.toBeInTheDocument();
    expect(screen.getByTestId("project-list")).toHaveTextContent("true");
  });

  it("hides the environment list on a project overview route", () => {
    h.isActivePath = true;
    renderDesktop(true);

    expect(screen.queryByTestId("env-list")).not.toBeInTheDocument();
  });

  it("toggles the sidebar when the panel button is pressed", () => {
    const { toggleSidebar } = renderDesktop(true);

    fireEvent.click(screen.getByRole("button"));

    expect(toggleSidebar).toHaveBeenCalled();
  });

  it("renders a separator for non-menu entries", () => {
    renderDesktop(true);

    expect(screen.getByTestId("separator")).toBeInTheDocument();
  });
});
