import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import type { WizardStepperContextType, WizardSteps } from "./wizard-stepper-models"

const WizardStepperContext = createContext<WizardStepperContextType | undefined>(
  undefined,
)

export const useWizardStepper = (): WizardStepperContextType => {
  const context = useContext(WizardStepperContext)
  if (!context) {
    throw new Error("useWizardStepper must be used within a WizardStepperProvider")
  }
  return context
}

export type WizardStepperProviderProps = {
  children: ReactNode
  steps: WizardSteps
  isStepValid?: (step: number) => boolean
  initialStep?: number
}

export const WizardStepperProvider = ({
  children,
  steps,
  isStepValid = () => true,
  initialStep = 1,
}: WizardStepperProviderProps) => {
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [completedSteps, setCompletedSteps] = useState<number[]>(
    Array.from({ length: initialStep - 1 }, (_, index) => index + 1),
  )
  const totalSteps = steps.length

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prevStep) => prevStep + 1)
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps((prevCompleted) => [...prevCompleted, currentStep])
      }
    }
  }

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prevStep) => prevStep - 1)
      setCompletedSteps((prevCompleted) =>
        prevCompleted.filter((step) => step !== currentStep - 1),
      )
    }
  }

  const goToStep = (step: number) => {
    const canNavigate =
      step > 0 &&
      step <= totalSteps &&
      (step === 1 || completedSteps.includes(step - 1)) &&
      isStepValid(step)

    if (canNavigate) {
      setCurrentStep(step)
      const newCompletedSteps = Array.from({ length: step - 1 }, (_, index) => index + 1)
      setCompletedSteps(newCompletedSteps)
    }
  }

  const contextValue = useMemo(
    () => ({
      currentStep,
      nextStep,
      previousStep,
      goToStep,
      completedSteps,
      setCompletedSteps,
      totalSteps,
      getSteps: () => steps,
    }),
    [
      currentStep,
      nextStep,
      previousStep,
      goToStep,
      completedSteps,
      setCompletedSteps,
      totalSteps,
      steps,
    ],
  )

  return (
    <WizardStepperContext.Provider value={contextValue}>
      {children}
    </WizardStepperContext.Provider>
  )
}
