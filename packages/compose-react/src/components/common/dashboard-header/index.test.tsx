import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/components/common", () => ({
  AppSwitcher: () => <div data-testid="app-switcher" />,
  ThemeSwitcher: () => <div data-testid="theme" />,
  UserDropdownMenu: () => <div data-testid="user" />,
  Notification: () => <div data-testid="notif" />,
  SelectedProject: () => <div>selected-project</div>,
  SelectedEnvironment: () => <div>selected-env</div>,
  BackToConsoleNavigator: () => <div data-testid="back" />,
  LanguageSelector: () => <div data-testid="lang" />,
  SidebarMobileView: () => <div data-testid="mobile" />,
}));

import { DashboardHeader } from "@/components/common/dashboard-header";
import { SidebarContext } from "@/contexts/dashboard-layout/sidebar.context";
import { useProjectStore } from "@/store";

const renderHeader = (
  ctx: { isSidebarOpen: boolean; toggleSidebar: () => void } = {
    isSidebarOpen: false,
    toggleSidebar: vi.fn(),
  },
  entries = ["/app/console"],
): ReturnType<typeof render> =>
  render(
    <MemoryRouter initialEntries={entries}>
      <SidebarContext.Provider value={ctx as never}>
        <DashboardHeader
          redirectPaths={{} as never}
          navigationMenus={[] as never}
        />
      </SidebarContext.Provider>
    </MemoryRouter>,
  );

beforeEach(() => {
  useProjectStore.getState().resetProjectStore();
});

describe("DashboardHeader", () => {
  it("renders the header actions", () => {
    renderHeader();
    expect(screen.getByTestId("theme")).toBeInTheDocument();
    expect(screen.getByTestId("user")).toBeInTheDocument();
  });

  it("toggles the sidebar when the panel button is clicked", () => {
    const toggleSidebar = vi.fn();
    renderHeader({ isSidebarOpen: false, toggleSidebar });
    fireEvent.click(screen.getByRole("button"));
    expect(toggleSidebar).toHaveBeenCalled();
  });

  it("shows selected project/environment when collapsed on a non-project route", () => {
    useProjectStore
      .getState()
      .setSelectedProject({ name: "P", environment: "prod" } as never);
    renderHeader({ isSidebarOpen: false, toggleSidebar: vi.fn() }, [
      "/app/console",
    ]);
    expect(screen.getAllByText("selected-project").length).toBeGreaterThan(0);
  });

  it("hides project selectors on the project-overview route", () => {
    useProjectStore
      .getState()
      .setSelectedProject({ name: "P", environment: "prod" } as never);
    renderHeader({ isSidebarOpen: false, toggleSidebar: vi.fn() }, [
      "/app/project/tg1",
    ]);
    expect(screen.queryByText("selected-project")).not.toBeInTheDocument();
  });
});
