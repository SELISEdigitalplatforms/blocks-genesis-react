"use client"

import { motion } from "framer-motion"

import { Button } from "@blocks/ui/components/button"
import { cn } from "@blocks/ui/lib/utils"
import { fadeTransition } from "@blocks/ui/lib/motion-presets"

import { WizardStepIndicator } from "./wizard-step-indicator"
import { useWizardStepper } from "./wizard-stepper-provider"

export const WizardVerticalTrackBar = () => {
  const { currentStep, totalSteps, goToStep, completedSteps, getSteps } = useWizardStepper()
  const steps = getSteps()

  return (
    <motion.div layout transition={fadeTransition}>
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isCompleted = completedSteps.includes(stepNumber)
        const isCurrent = currentStep === stepNumber

        return (
          <div
            className={cn("relative flex flex-col [&:not(:last-child)]:flex-1")}
            key={step.id}
          >
            <motion.div layout className="flex items-center gap-2" transition={fadeTransition}>
              <Button
                type="button"
                variant="ghost"
                className="size-8 rounded-full p-0 hover:bg-transparent"
                onClick={() => goToStep(stepNumber)}
                aria-current={isCurrent ? "step" : undefined}
              >
                <WizardStepIndicator
                  stepNumber={stepNumber}
                  isCurrent={isCurrent}
                  isCompleted={isCompleted}
                />
              </Button>
              <motion.div
                layout
                animate={{
                  color: isCurrent || isCompleted
                    ? "hsl(var(--foreground))"
                    : "hsl(var(--muted-foreground))",
                }}
                transition={fadeTransition}
                className="ml-4 text-base font-medium"
              >
                {step.title}
              </motion.div>
            </motion.div>
            {index !== totalSteps - 1 ? (
              <motion.div
                className="my-2 ml-4 h-11 w-px origin-top bg-border"
                initial={false}
                animate={{
                  scaleY: isCompleted ? 1 : 0.35,
                  backgroundColor: isCompleted
                    ? "hsl(var(--foreground))"
                    : "hsl(var(--border))",
                }}
                transition={fadeTransition}
              />
            ) : null}
          </div>
        )
      })}
    </motion.div>
  )
}
