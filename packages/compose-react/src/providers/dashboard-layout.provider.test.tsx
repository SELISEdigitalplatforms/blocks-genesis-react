import { describe, it, expect, beforeEach } from "vitest";
import { useContext } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { SidebarContext } from "@/contexts";
import { DashboardLayoutProvider } from "@/providers/dashboard-layout.provider";
import { useLayoutSettingsStore } from "@/store/layout-settings.store";

function Consumer() {
  const ctx = useContext(SidebarContext)!;
  return (
    <div>
      <span data-testid="open">{String(ctx.isSidebarOpen)}</span>
      <span data-testid="submenu">{String(ctx.isSidebarSubMenuOpen)}</span>
      <span data-testid="submenuId">{ctx.subMenuId ?? "none"}</span>
      <span data-testid="search">{ctx.servicesSearchTerm}</span>
      <button onClick={ctx.toggleSidebar}>toggle</button>
      <button onClick={ctx.closeSidebar}>close</button>
      <button onClick={ctx.toggleSidebarSubMenu}>toggleSub</button>
      <button onClick={ctx.showSidebarSubMenu}>showSub</button>
      <button onClick={() => ctx.updateSubMenuId("m1")}>setId</button>
      <button onClick={() => ctx.updateServicesSearchTerm("q")}>
        setSearch
      </button>
    </div>
  );
}

const renderProvider = (props: { isOpen?: boolean } = {}) =>
  render(
    <MemoryRouter>
      <DashboardLayoutProvider isOpen {...props}>
        <Consumer />
      </DashboardLayoutProvider>
    </MemoryRouter>,
  );

beforeEach(() => {
  localStorage.clear();
  useLayoutSettingsStore.getState().resetLayout();
});

describe("DashboardLayoutProvider", () => {
  it("exposes sidebar state and toggles it", () => {
    renderProvider();
    expect(screen.getByTestId("open")).toHaveTextContent("true");
    fireEvent.click(screen.getByText("toggle"));
    expect(screen.getByTestId("open")).toHaveTextContent("false");
  });

  it("closes the sidebar via closeSidebar", () => {
    renderProvider();
    fireEvent.click(screen.getByText("close"));
    expect(screen.getByTestId("open")).toHaveTextContent("false");
    expect(useLayoutSettingsStore.getState().layout.isLeftSidebarOpen).toBe(
      false,
    );
  });

  it("manages the sub-menu open state", () => {
    renderProvider();
    fireEvent.click(screen.getByText("showSub"));
    expect(screen.getByTestId("submenu")).toHaveTextContent("true");
    fireEvent.click(screen.getByText("toggleSub"));
    expect(screen.getByTestId("submenu")).toHaveTextContent("false");
  });

  it("updates the submenu id (persisted) and services search term", () => {
    renderProvider();
    fireEvent.click(screen.getByText("setId"));
    expect(screen.getByTestId("submenuId")).toHaveTextContent("m1");
    expect(localStorage.getItem("subMenuId")).toBe("m1");
    fireEvent.click(screen.getByText("setSearch"));
    expect(screen.getByTestId("search")).toHaveTextContent("q");
  });

  it("loads the persisted open state from the store on mount", () => {
    useLayoutSettingsStore.setState({
      layout: { isLeftSidebarOpen: false },
    });
    renderProvider({ isOpen: true });
    expect(screen.getByTestId("open")).toHaveTextContent("false");
  });

  it("persists toggles to the layout-settings store", () => {
    renderProvider({ isOpen: false });
    fireEvent.click(screen.getByText("toggle"));
    expect(useLayoutSettingsStore.getState().layout.isLeftSidebarOpen).toBe(
      true,
    );
  });
});
