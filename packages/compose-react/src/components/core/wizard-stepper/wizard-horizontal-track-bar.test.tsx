import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { WizardSteps } from "./wizard-stepper-models";
import { WizardStepperProvider } from "./wizard-stepper-provider";
import { WizardHorizontalTrackBar } from "./wizard-horizontal-track-bar";

const STEPS: WizardSteps = [
  { id: 1, title: "One" },
  { id: 2, title: "Two" },
  { id: 3, title: "Three" },
];

const renderBar = (initialStep = 1) =>
  render(
    <WizardStepperProvider steps={STEPS} initialStep={initialStep}>
      <WizardHorizontalTrackBar />
    </WizardStepperProvider>,
  );

describe("WizardHorizontalTrackBar", () => {
  it("renders one button per step with the step titles", () => {
    renderBar();

    expect(screen.getAllByRole("button")).toHaveLength(3);
    expect(screen.getByText("One")).toBeInTheDocument();
    expect(screen.getByText("Three")).toBeInTheDocument();
  });

  it("marks the current step with aria-current", () => {
    renderBar(2);

    const buttons = screen.getAllByRole("button");
    expect(buttons[1]).toHaveAttribute("aria-current", "step");
  });

  it("navigates to a reachable earlier step on click", () => {
    renderBar(2);

    fireEvent.click(screen.getAllByRole("button")[0]);

    expect(screen.getAllByRole("button")[0]).toHaveAttribute(
      "aria-current",
      "step",
    );
  });

  it("ignores clicks on an unreachable later step", () => {
    renderBar(2);

    fireEvent.click(screen.getAllByRole("button")[2]);

    expect(screen.getAllByRole("button")[1]).toHaveAttribute(
      "aria-current",
      "step",
    );
  });
});
