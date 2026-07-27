import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SidebarMobileView } from "./mobile-view";

const h = vi.hoisted(() => ({
  filteredMenus: vi.fn(),
}));

vi.mock("@/components", () => {
  const passthrough = ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  );
  return {
    Button: ({
      children,
      onClick,
    }: {
      children: ReactNode;
      onClick?: () => void;
    }) => <button onClick={onClick}>{children}</button>,
    EnvironmentList: () => <div data-testid="env-list" />,
    MobileMenuItem: ({
      menu,
      onClick,
    }: {
      menu: { label?: string; id: string };
      onClick: () => void;
    }) => <button onClick={onClick}>{menu.label ?? menu.id}</button>,
    ProjectList: () => <div data-testid="project-list" />,
    Separator: () => <hr data-testid="separator" />,
    Sheet: passthrough,
    SheetClose: ({ children }: { children: ReactNode }) => (
      <button>{children}</button>
    ),
    SheetContent: passthrough,
    SheetHeader: passthrough,
    SheetTitle: passthrough,
    SheetTrigger: passthrough,
  };
});

vi.mock("../logo", () => ({
  Logo: () => <div data-testid="logo" />,
}));

vi.mock("@/hooks/use-menus", () => ({
  useFilteredMenus: (...args: unknown[]) => h.filteredMenus(...args),
}));
vi.mock("@/hooks/use-logo", () => ({
  useLogo: () => ({ appLightLogo: "light.svg", appDarkLogo: "dark.svg" }),
}));

describe("SidebarMobileView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.filteredMenus.mockReturnValue([
      { id: "m1", type: "menu", label: "Dashboard" },
      { id: "s1", type: "separator" },
    ]);
  });

  it("renders the workspace sections and menu entries", () => {
    render(
      <MemoryRouter>
        <SidebarMobileView redirectPaths={{}} navigationMenus={[]} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Project")).toBeInTheDocument();
    expect(screen.getByText("Environment")).toBeInTheDocument();
    expect(screen.getByTestId("project-list")).toBeInTheDocument();
    expect(screen.getByTestId("env-list")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("logo")).toBeInTheDocument();
  });

  it("closes the sheet when a menu item is activated", () => {
    render(
      <MemoryRouter>
        <SidebarMobileView redirectPaths={{}} navigationMenus={[]} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("Dashboard"));

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
});
