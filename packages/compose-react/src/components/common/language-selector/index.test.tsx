import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { configureI18n } from "@/i18n/config";
import { resetLanguages, useLanguagesStore } from "@/i18n/languages";
import { LanguageSelector } from "./index";

const h = vi.hoisted(() => ({
  changeLanguage: vi.fn(),
  language: "en" as string | undefined,
}));

vi.mock("@/hooks/use-language-switcher", () => ({
  useLanguageSwitcher: () => ({
    changeLanguage: h.changeLanguage,
    language: h.language,
  }),
}));

vi.mock("@/store/app-settings.store", () => ({
  useAppSettingsStore: Object.assign(
    (select: (state: { settings: { language?: string } }) => unknown) =>
      select({ settings: { language: h.language } }),
    { getState: () => ({ settings: { language: h.language } }) },
  ),
}));

const setProjectLanguages = () =>
  act(() =>
    useLanguagesStore.getState().setLanguages([
      { code: "en", culture: "en-US", title: "English" },
      { code: "de", culture: "de-DE", title: "Deutsch", isDefault: true },
      { code: "fr", culture: "fr-FR", title: "Français" },
    ]),
  );

describe("LanguageSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.language = "en";
    resetLanguages();
    // No service in tests: the list comes from setProjectLanguages.
    configureI18n({ baseUrl: () => "", blocksKey: () => "" });
  });

  it("is hidden while the project offers only English", () => {
    const { container } = render(<LanguageSelector />);
    expect(container).toBeEmptyDOMElement();
  });

  it("lists the project's languages and shows the current one", async () => {
    setProjectLanguages();
    const user = userEvent.setup();
    render(<LanguageSelector />);

    expect(screen.getByText("en")).toBeInTheDocument();
    await user.click(screen.getByRole("button"));

    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("Deutsch")).toBeInTheDocument();
    expect(screen.getByText("Français")).toBeInTheDocument();
  });

  it("changes the language when an option is selected", async () => {
    setProjectLanguages();
    const user = userEvent.setup();
    render(<LanguageSelector />);

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("Français"));

    expect(h.changeLanguage).toHaveBeenCalledWith("fr");
  });

  it("shows the project's default when nothing or an unknown language is stored", () => {
    setProjectLanguages();
    h.language = "it";
    render(<LanguageSelector />);

    expect(screen.getByText("de")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("de");
  });
});
