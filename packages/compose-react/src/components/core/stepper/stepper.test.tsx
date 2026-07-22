import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Stepper } from "@/components/core/stepper/stepper";

const steps = [
  { id: "1", title: "One", description: "first" },
  { id: "2", title: "Two" },
  { id: "3", title: "Three" },
];

describe("Stepper", () => {
  it("renders every step and marks the current one", () => {
    render(<Stepper steps={steps} currentStep={1} />);
    expect(screen.getByText("One")).toBeInTheDocument();
    expect(screen.getByText("Two")).toBeInTheDocument();
    expect(screen.getByText("Three")).toBeInTheDocument();
    expect(screen.getByText("first")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Progress" })).toBeInTheDocument();
  });

  it("supports vertical orientation", () => {
    render(<Stepper steps={steps} currentStep={2} orientation="vertical" />);
    expect(screen.getByText("Three")).toBeInTheDocument();
  });
});
