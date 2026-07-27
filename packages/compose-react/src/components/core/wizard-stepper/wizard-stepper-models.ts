export type WizardSteps = Array<{ id: number; title: string }>;

export type WizardStepperContextType = {
  currentStep: number;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  setCompletedSteps: (steps: number[]) => void;
  completedSteps: number[];
  totalSteps: number;
  getSteps: () => WizardSteps;
};
