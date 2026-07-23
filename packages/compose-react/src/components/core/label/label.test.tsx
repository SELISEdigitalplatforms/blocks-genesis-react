import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Label } from "@/components/core/label/label";

describe("Label", () => {
  it("renders its label text", () => {
    render(<Label htmlFor="x">Name</Label>);
    expect(screen.getByText("Name")).toBeInTheDocument();
  });
});
