import type { ReactNode } from "react";

export type WizardStepContentProps = {
  currentStep: number;
  stepNumber: number;
  children: ReactNode;
};

export const WizardStepContent = ({
  currentStep,
  stepNumber,
  children,
}: WizardStepContentProps) => {
  if (currentStep !== stepNumber) {
    return null;
  }

  return <>{children}</>;
};
