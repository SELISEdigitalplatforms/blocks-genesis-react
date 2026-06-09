"use client"

import { motion } from "framer-motion"

import { Button } from "@/components/core/button"
import { cn } from "@/lib/utils"
import { fadeTransition } from "@/lib/motion-presets"

import { WizardStepIndicator } from "./wizard-step-indicator"
import { useWizardStepper } from "./wizard-stepper-provider"

export const WizardHorizontalTrackBar = () => {
  const { currentStep, completedSteps, goToStep, getSteps } = useWizardStepper()
  const steps = getSteps()

  return (
    <motion.div
      layout
      className="flex w-full flex-row flex-wrap justify-between"
      transition={fadeTransition}
    >
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isCompleted = completedSteps.includes(stepNumber)
        const isCurrent = currentStep === stepNumber

        return (
          <div
            className={cn(
              "relative flex items-center after:h-0.5 after:flex-1 after:border-t after:content-['']",
              "[&:not(:last-child)]:flex-1 [&:not(:last-child)]:after:me-[35px] [&:not(:last-child)]:after:ms-[35px]",
              isCompleted ? "after:border-foreground" : "after:border-border",
            )}
            key={step.id}
          >
            <div className="flex items-center gap-2">
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
                className="hidden md:block"
              >
                {step.title}
              </motion.div>
            </div>
          </div>
        )
      })}
    </motion.div>
  )
}
