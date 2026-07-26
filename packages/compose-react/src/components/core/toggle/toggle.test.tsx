import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Toggle } from "@/components/core/toggle/toggle";
import { toggleVariants } from "@/components/core/toggle/toggle-variants";

describe("Toggle", () => {
  it("renders a toggle button", () => {
    render(<Toggle aria-label="bold">B</Toggle>);
    expect(screen.getByRole("button", { name: "bold" })).toBeInTheDocument();
  });

  it("exposes toggleVariants for class generation", () => {
    expect(typeof toggleVariants({ variant: "outline", size: "lg" })).toBe(
      "string",
    );
  });
});
