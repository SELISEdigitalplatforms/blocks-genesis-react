import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "./theme.provider";

const h = vi.hoisted(() => ({
  store: {} as {
    settings: { theme: string };
    systemTheme: string;
    setSettings: (value: unknown) => void;
    setSystemTheme: (value: string) => void;
  },
}));

vi.mock("@/store", () => ({
  useAppSettingsStore: () => h.store,
}));
vi.mock("@/lib/theme", () => ({ applyTheme: vi.fn() }));

import { applyTheme } from "@/lib/theme";

const clearCookie = () => {
  document.cookie = "app-settings-storage=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
};

describe("ThemeProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCookie();
    h.store = {
      settings: { theme: "light" },
      systemTheme: "light",
      setSettings: vi.fn(),
      setSystemTheme: vi.fn(),
    };
  });

  afterEach(clearCookie);

  it("applies the resolved theme and renders children on mount", () => {
    render(
      <ThemeProvider>
        <span>child</span>
      </ThemeProvider>,
    );

    expect(applyTheme).toHaveBeenCalledWith("light");
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("seeds the default theme when no persisted cookie exists", () => {
    render(<ThemeProvider defaultTheme="dark">x</ThemeProvider>);

    expect(h.store.setSettings).toHaveBeenCalledWith({ theme: "dark" });
  });

  it("does not seed the default theme when a cookie is already present", () => {
    document.cookie = "app-settings-storage=persisted";

    render(<ThemeProvider defaultTheme="dark">x</ThemeProvider>);

    expect(h.store.setSettings).not.toHaveBeenCalled();
  });

  it("resolves the system theme when the setting is 'system'", () => {
    h.store.settings = { theme: "system" };
    h.store.systemTheme = "dark";

    render(<ThemeProvider>x</ThemeProvider>);

    expect(applyTheme).toHaveBeenCalledWith("dark");
  });

  it("fires onThemeChange on a change but not on the initial mount", () => {
    const onThemeChange = vi.fn();
    const { rerender } = render(
      <ThemeProvider onThemeChange={onThemeChange}>x</ThemeProvider>,
    );
    expect(onThemeChange).not.toHaveBeenCalled();

    h.store.settings = { theme: "dark" };
    rerender(<ThemeProvider onThemeChange={onThemeChange}>x</ThemeProvider>);

    expect(onThemeChange).toHaveBeenCalledWith("dark", "dark");
  });
});
