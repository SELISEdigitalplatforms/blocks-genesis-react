import { createContext, useContext } from "react";

import type { WizardStepperContextType } from "./wizard-stepper-models";

export const WizardStepperContext = createContext<
  WizardStepperContextType | undefined
>(undefined);

export const useWizardStepper = (): WizardStepperContextType => {
  const context = useContext(WizardStepperContext);
  if (!context) {
    throw new Error(
      "useWizardStepper must be used within a WizardStepperProvider",
    );
  }
  return context;
};
