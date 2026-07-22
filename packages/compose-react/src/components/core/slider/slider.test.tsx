import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Slider } from "@/components/core/slider/slider";

describe("Slider", () => {
  it("renders a slider thumb", () => {
    render(<Slider defaultValue={[50]} max={100} />);
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });
});
