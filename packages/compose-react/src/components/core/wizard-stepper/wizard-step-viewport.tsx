"use client"

import type { ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { fadeInUp, fadeTransition } from "@/lib/motion-presets"

import { useWizardStepper } from "./wizard-stepper-provider"

export type WizardStepViewportProps = {
  children: ReactNode
  className?: string
}

export const WizardStepViewport = ({ children, className }: WizardStepViewportProps) => {
  const { currentStep } = useWizardStepper()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep}
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={fadeTransition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
