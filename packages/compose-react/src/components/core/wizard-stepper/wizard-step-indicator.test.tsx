import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WizardStepIndicator } from "./wizard-step-indicator";

describe("WizardStepIndicator", () => {
  it("renders the step number when the step is not complete", () => {
    render(
      <WizardStepIndicator stepNumber={2} isCurrent isCompleted={false} />,
    );

    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders a check icon instead of the number when complete", () => {
    const { container } = render(
      <WizardStepIndicator stepNumber={2} isCurrent={false} isCompleted />,
    );

    expect(screen.queryByText("2")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
