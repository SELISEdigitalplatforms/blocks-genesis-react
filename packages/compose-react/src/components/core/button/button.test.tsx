import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/core/button/button";
import { buttonVariants } from "@/components/core/button/button-variants";

describe("Button", () => {
  it("renders its children inside a button element", () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole("button", { name: "Click" })).toBeInTheDocument();
  });

  it("applies variant and size classes", () => {
    render(
      <Button variant="destructive" size="lg">
        X
      </Button>,
    );
    expect(screen.getByRole("button", { name: "X" }).className).toContain(
      "bg-destructive",
    );
  });

  it("renders as a child slot when asChild is set", () => {
    render(
      <Button asChild>
        <a href="/x">link</a>
      </Button>,
    );
    expect(screen.getByRole("link", { name: "link" })).toBeInTheDocument();
  });

  it("exposes buttonVariants for class generation", () => {
    expect(typeof buttonVariants()).toBe("string");
  });
});
