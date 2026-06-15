"use client"

import { Check } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

import { cn } from "@blocks-kit/ui/lib/utils"
import { fadeTransition } from "@blocks-kit/ui/lib/motion-presets"

type WizardStepIndicatorProps = {
  stepNumber: number
  isCurrent: boolean
  isCompleted: boolean
  className?: string
}

export const WizardStepIndicator = ({
  stepNumber,
  isCurrent,
  isCompleted,
  className,
}: WizardStepIndicatorProps) => (
  <motion.span
    layout
    initial={false}
    animate={{
      scale: isCurrent ? 1.06 : 1,
      borderColor:
        isCompleted || isCurrent ? "hsl(var(--foreground))" : "hsl(var(--border))",
      color:
        isCompleted || isCurrent
          ? isCompleted
            ? "hsl(var(--primary-foreground))"
            : "hsl(var(--foreground))"
          : "hsl(var(--muted-foreground))",
      backgroundColor: isCompleted ? "hsl(var(--foreground))" : "transparent",
    }}
    transition={fadeTransition}
    className={cn(
      "flex size-8 items-center justify-center rounded-full border text-lg font-bold",
      className,
    )}
  >
    <AnimatePresence mode="wait" initial={false}>
      {isCompleted ? (
        <motion.span
          key="check"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={fadeTransition}
        >
          <Check className="size-[18px]" aria-hidden />
        </motion.span>
      ) : (
        <motion.span
          key="number"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={fadeTransition}
        >
          {stepNumber}
        </motion.span>
      )}
    </AnimatePresence>
  </motion.span>
)
