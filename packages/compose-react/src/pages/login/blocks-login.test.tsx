import { describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router";

vi.mock("@/components/common/login-header/login-header", () => ({
  LoginHeader: () => <div data-testid="login-header" />,
}));

import { BlocksLoginPage } from "@/pages/login/blocks-login";

const wrap = (ui: ReactNode) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe("BlocksLoginPage", () => {
  it("renders a login action for a known product", () => {
    wrap(<BlocksLoginPage name="blocks-os" onLogin={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: "Log in to your account" }),
    ).toBeInTheDocument();
  });

  it("invokes onLogin when the login button is clicked", () => {
    const onLogin = vi.fn();
    wrap(<BlocksLoginPage name="blocks-os" onLogin={onLogin} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Log in to your account" }),
    );
    expect(onLogin).toHaveBeenCalled();
  });

  it("falls back to the first product when the name is unknown", () => {
    wrap(<BlocksLoginPage name="does-not-exist" onLogin={vi.fn()} />);
    expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
  });

  it("accepts explicit carousel items and a custom login label", () => {
    const items = [
      {
        name: "blocks-os",
        appName: "Blocks OS",
        tagline: "tag",
        descriptionTitle: "title",
        keywords: ["fast"],
        shortDescription: "short",
        description: "desc",
        featureChips: ["chip"],
        badge: "badge",
        url: "",
        cta: "Go",
      },
    ];
    wrap(
      <BlocksLoginPage
        name="blocks-os"
        onLogin={vi.fn()}
        isLoading
        loginLabel="Signing in"
        carouselItems={items as never}
      />,
    );
    expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
  });
});
