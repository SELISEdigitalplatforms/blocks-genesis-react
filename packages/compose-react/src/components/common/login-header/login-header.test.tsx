import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureI18n, resetI18nRequests, useI18nStore } from "@/i18n";
import { resetLanguages, useLanguagesStore } from "@/i18n/languages";
import { useAppSettingsStore } from "@/store/app-settings.store";
import { LoginHeader } from "./login-header";

const h = vi.hoisted(() => ({
  appLogoUrl: undefined as unknown,
}));

vi.mock("@/hooks/use-blocks-app-config-store", () => ({
  useBlocksAppConfigStore: () => ({ config: { appLogoUrl: h.appLogoUrl } }),
}));
vi.mock("..", () => ({
  ThemeSwitcher: () => <div data-testid="theme-switcher" />,
}));
vi.mock("../logo", () => ({
  Logo: ({ lightSrc, darkSrc }: { lightSrc?: string; darkSrc?: string }) => (
    <div data-testid="logo" data-light={lightSrc} data-dark={darkSrc} />
  ),
}));

describe("LoginHeader", () => {
  beforeEach(() => {
    h.appLogoUrl = undefined;
    configureI18n({ baseUrl: () => "", blocksKey: () => "" });
    resetLanguages();
    resetI18nRequests();
    useAppSettingsStore.getState().setSettings({ language: "en" });
  });

  afterEach(() => {
    useAppSettingsStore.getState().setSettings({ language: "en" });
    useI18nStore.setState({ remote: {} });
    resetLanguages();
  });

  it("renders the docs, blocks and github links with default urls", () => {
    render(<LoginHeader />);

    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute(
      "href",
      "https://docs.seliseblocks.com/",
    );
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/SELISEdigitalplatforms",
    );
  });

  it("uses a string logo url for both light and dark logos", () => {
    h.appLogoUrl = "logo.png";

    render(<LoginHeader />);

    const logo = screen.getByTestId("logo");
    expect(logo).toHaveAttribute("data-light", "logo.png");
    expect(logo).toHaveAttribute("data-dark", "logo.png");
  });

  it("uses the light/dark variants from an object logo url", () => {
    h.appLogoUrl = { light: "light.png", dark: "dark.png" };

    render(<LoginHeader />);

    const logo = screen.getByTestId("logo");
    expect(logo).toHaveAttribute("data-light", "light.png");
    expect(logo).toHaveAttribute("data-dark", "dark.png");
  });

  it("honors custom link urls", () => {
    render(<LoginHeader docsUrl="https://custom.docs" />);

    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute(
      "href",
      "https://custom.docs",
    );
  });

  it("switches the login text and persists the selected project language", async () => {
    useLanguagesStore.getState().setLanguages([
      { code: "en", culture: "en-US", title: "English", isDefault: true },
      { code: "de", culture: "de-DE", title: "Deutsch" },
    ]);
    useI18nStore.getState().setRemote("de", "genesis.shared", {
      "LOGIN_HEADER.DOCS": "Dokumentation",
      "LANGUAGE_SELECTOR.CHANGE_LANGUAGE": "Sprache ändern",
    });
    const user = userEvent.setup();
    render(<LoginHeader />);

    await user.click(screen.getByRole("button", { name: "Change language" }));
    expect(
      screen.getByRole("menuitemradio", { name: "English" }),
    ).toHaveAttribute("aria-checked", "true");
    await user.click(screen.getByRole("menuitemradio", { name: "Deutsch" }));

    expect(screen.getByRole("link", { name: "Dokumentation" })).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Sprache ändern" }),
    ).toHaveTextContent("de");
    expect(document.documentElement.lang).toBe("de");
    expect(useAppSettingsStore.getState().settings.language).toBe("de");
    const cookie = document.cookie
      .split("; ")
      .find((item) => item.startsWith("app-settings-storage="));
    expect(
      JSON.parse(decodeURIComponent(cookie!.split("=").slice(1).join("=")))
        .settings.language,
    ).toBe("de");

    await user.click(screen.getByRole("button", { name: "Sprache ändern" }));
    await user.click(screen.getByRole("menuitemradio", { name: "English" }));
    expect(screen.getByRole("link", { name: "Docs" })).toBeVisible();
  });

  it("keeps the language control hidden when there is only one language", () => {
    render(<LoginHeader />);
    expect(
      screen.queryByRole("button", { name: "Change language" }),
    ).not.toBeInTheDocument();
  });
});
