import { describe, it, expect } from "vitest";
import { vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/components/common/app-switcher", () => ({
  AppSwitcher: () => <div data-testid="app-switcher" />,
}));
vi.mock("@/components/common/language-selector", () => ({
  LanguageSelector: () => <div data-testid="language" />,
}));
vi.mock("@/components/common/logo", () => ({
  Logo: () => <div>logo</div>,
}));
vi.mock("@/components/common/notification", () => ({
  Notification: () => <div data-testid="notification" />,
}));
vi.mock("@/components/common/theme-switcher", () => ({
  ThemeSwitcher: () => <div data-testid="theme" />,
}));
vi.mock("@/components/common/user-dropdown-menu", () => ({
  UserDropdownMenu: () => <div data-testid="user-menu" />,
}));
vi.mock("@/hooks/use-logo", () => ({
  useLogo: () => ({ appLightLogo: "light.png", appDarkLogo: "dark.png" }),
}));

import { ConsoleHeader } from "@/components/common/console-header/console-header";

const renderHeader = (entries = ["/console"]) =>
  render(
    <MemoryRouter initialEntries={entries}>
      <ConsoleHeader />
    </MemoryRouter>,
  );

describe("ConsoleHeader", () => {
  it("renders the logo and header actions", () => {
    renderHeader();
    expect(screen.getByText("logo")).toBeInTheDocument();
    expect(screen.getAllByTestId("theme").length).toBeGreaterThan(0);
  });

  it("uses the console-button layout on project routes", () => {
    renderHeader(["/app/project/tg1/repositories"]);
    expect(screen.getByText("logo")).toBeInTheDocument();
  });

  it("adds a border when the page is scrolled", () => {
    const { container } = renderHeader();
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 50,
    });
    fireEvent.scroll(window);
    expect(container.querySelector(".border-b")).toBeTruthy();
  });
});
