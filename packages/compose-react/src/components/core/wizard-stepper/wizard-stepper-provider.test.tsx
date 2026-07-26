import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { WizardSteps } from "./wizard-stepper-models";
import { useWizardStepper } from "./use-wizard-stepper";
import {
  WizardStepperProvider,
  type WizardStepperProviderProps,
} from "./wizard-stepper-provider";

const STEPS: WizardSteps = [
  { id: 1, title: "One" },
  { id: 2, title: "Two" },
  { id: 3, title: "Three" },
];

const makeWrapper = (props: Partial<WizardStepperProviderProps> = {}) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <WizardStepperProvider steps={STEPS} {...props}>
      {children}
    </WizardStepperProvider>
  );
  return Wrapper;
};

const renderStepper = (props?: Partial<WizardStepperProviderProps>) =>
  renderHook(() => useWizardStepper(), { wrapper: makeWrapper(props) });

describe("WizardStepperProvider", () => {
  it("throws when the hook is used outside a provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => renderHook(() => useWizardStepper())).toThrow(
      "useWizardStepper must be used within a WizardStepperProvider",
    );
  });

  it("starts on step one with no completed steps", () => {
    const { result } = renderStepper();

    expect(result.current.currentStep).toBe(1);
    expect(result.current.completedSteps).toEqual([]);
    expect(result.current.totalSteps).toBe(3);
    expect(result.current.getSteps()).toEqual(STEPS);
  });

  it("seeds completed steps from the initial step", () => {
    const { result } = renderStepper({ initialStep: 3 });

    expect(result.current.currentStep).toBe(3);
    expect(result.current.completedSteps).toEqual([1, 2]);
  });

  it("advances and marks the current step complete on nextStep", () => {
    const { result } = renderStepper();

    act(() => result.current.nextStep());

    expect(result.current.currentStep).toBe(2);
    expect(result.current.completedSteps).toContain(1);
  });

  it("does not advance past the last step", () => {
    const { result } = renderStepper({ initialStep: 3 });

    act(() => result.current.nextStep());

    expect(result.current.currentStep).toBe(3);
  });

  it("steps back and clears the prior completed step on previousStep", () => {
    const { result } = renderStepper({ initialStep: 2 });

    act(() => result.current.previousStep());

    expect(result.current.currentStep).toBe(1);
    expect(result.current.completedSteps).not.toContain(1);
  });

  it("does not step back before the first step", () => {
    const { result } = renderStepper();

    act(() => result.current.previousStep());

    expect(result.current.currentStep).toBe(1);
  });

  it("navigates to a reachable step via goToStep", () => {
    const { result } = renderStepper({ initialStep: 3 });

    act(() => result.current.goToStep(2));
    expect(result.current.currentStep).toBe(2);

    act(() => result.current.goToStep(1));
    expect(result.current.currentStep).toBe(1);
  });

  it("blocks goToStep for an unreachable or out-of-range step", () => {
    const { result } = renderStepper();

    act(() => result.current.goToStep(3));
    expect(result.current.currentStep).toBe(1);

    act(() => result.current.goToStep(0));
    expect(result.current.currentStep).toBe(1);
  });

  it("blocks goToStep when the step is invalid", () => {
    const { result } = renderStepper({ isStepValid: () => false });

    act(() => result.current.goToStep(1));

    expect(result.current.currentStep).toBe(1);
  });
});
