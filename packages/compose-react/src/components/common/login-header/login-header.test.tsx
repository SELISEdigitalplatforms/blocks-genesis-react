import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
});
