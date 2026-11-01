import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageSelector } from "./index";

const h = vi.hoisted(() => ({
  changeLanguage: vi.fn(),
  language: "en",
}));

vi.mock("@/hooks/use-language-switcher", () => ({
  useLanguageSwitcher: () => ({
    changeLanguage: h.changeLanguage,
    language: h.language,
  }),
}));

describe("LanguageSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.language = "en";
  });

  it("shows the current language on the trigger", () => {
    render(<LanguageSelector />);

    expect(screen.getByText("en")).toBeInTheDocument();
  });

  it("lists the available languages when opened", async () => {
    const user = userEvent.setup();
    render(<LanguageSelector />);

    await user.click(screen.getByRole("button"));

    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("Deutsch")).toBeInTheDocument();
    expect(screen.queryByText("French")).not.toBeInTheDocument();
  });

  it("changes the language when an enabled option is selected", async () => {
    const user = userEvent.setup();
    render(<LanguageSelector />);

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("English"));

    expect(h.changeLanguage).toHaveBeenCalledWith("en");
  });

  it("switches to German", async () => {
    const user = userEvent.setup();
    render(<LanguageSelector />);

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("Deutsch"));

    expect(h.changeLanguage).toHaveBeenCalledWith("de");
  });

  it("shows English for an unsupported stored language and sets the page lang", () => {
    h.language = "fr";
    render(<LanguageSelector />);

    expect(screen.getByText("en")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("en");
  });
});
