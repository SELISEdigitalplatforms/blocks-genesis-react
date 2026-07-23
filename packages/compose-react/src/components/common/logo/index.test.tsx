import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Logo } from "./index";

describe("Logo", () => {
  it("renders a light and a dark image with the default alt text", () => {
    render(<Logo />);

    const images = screen.getAllByRole("img", { hidden: true });
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute("alt", "Logo");
  });

  it("uses the provided light and dark sources", () => {
    render(<Logo lightSrc="light.png" darkSrc="dark.png" />);

    const images = screen.getAllByRole("img", { hidden: true });
    expect(images[0]).toHaveAttribute("src", "light.png");
    expect(images[1]).toHaveAttribute("src", "dark.png");
  });

  it("falls back to the shared src when no variant is given", () => {
    render(<Logo src="shared.png" alt="Brand" />);

    const images = screen.getAllByRole("img", { hidden: true });
    expect(images[0]).toHaveAttribute("src", "shared.png");
    expect(images[1]).toHaveAttribute("src", "shared.png");
    expect(images[0]).toHaveAttribute("alt", "Brand");
  });
});
