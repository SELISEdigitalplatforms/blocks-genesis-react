import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { WizardSteps } from "./wizard-stepper-models";
import { WizardStepperProvider } from "./wizard-stepper-provider";
import { WizardVerticalTrackBar } from "./wizard-vertical-track-bar";

const STEPS: WizardSteps = [
  { id: 1, title: "One" },
  { id: 2, title: "Two" },
  { id: 3, title: "Three" },
];

const renderBar = (initialStep = 1) =>
  render(
    <WizardStepperProvider steps={STEPS} initialStep={initialStep}>
      <WizardVerticalTrackBar />
    </WizardStepperProvider>,
  );

describe("WizardVerticalTrackBar", () => {
  it("renders a button and title for every step", () => {
    renderBar();

    expect(screen.getAllByRole("button")).toHaveLength(3);
    expect(screen.getByText("Two")).toBeInTheDocument();
  });

  it("marks the current step with aria-current", () => {
    renderBar(3);

    expect(screen.getAllByRole("button")[2]).toHaveAttribute(
      "aria-current",
      "step",
    );
  });

  it("navigates to a reachable earlier step on click", () => {
    renderBar(3);

    fireEvent.click(screen.getAllByRole("button")[0]);

    expect(screen.getAllByRole("button")[0]).toHaveAttribute(
      "aria-current",
      "step",
    );
  });
});
