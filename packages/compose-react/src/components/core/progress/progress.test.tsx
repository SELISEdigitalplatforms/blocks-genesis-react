import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Progress } from "@/components/core/progress/progress";

describe("Progress", () => {
  it("renders a progressbar for the given value", () => {
    render(<Progress value={50} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("treats a missing value as zero", () => {
    render(<Progress />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
