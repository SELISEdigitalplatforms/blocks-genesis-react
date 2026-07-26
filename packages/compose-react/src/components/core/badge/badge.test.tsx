import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge, badgeVariants } from "@/components/core/badge/badge";

describe("Badge", () => {
  it("renders its content", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("applies the outline variant", () => {
    render(<Badge variant="outline">Tag</Badge>);
    expect(screen.getByText("Tag").className).toContain("text-foreground");
  });

  it("exposes badgeVariants for class generation", () => {
    expect(typeof badgeVariants()).toBe("string");
  });
});
