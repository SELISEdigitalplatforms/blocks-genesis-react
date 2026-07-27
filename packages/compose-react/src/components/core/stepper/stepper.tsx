import * as React from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export type StepStatus = "complete" | "current" | "upcoming";

export interface StepperStep {
  /** Stable id used as React key. */
  id: string;
  title: string;
  description?: string;
}

export interface StepperProps extends React.HTMLAttributes<HTMLOListElement> {
  steps: StepperStep[];
  /** Zero-based index of the current step. */
  currentStep: number;
  orientation?: "horizontal" | "vertical";
}

function getStatus(index: number, current: number): StepStatus {
  if (index < current) return "complete";
  if (index === current) return "current";
  return "upcoming";
}

interface StepperItemProps {
  step: StepperStep;
  index: number;
  currentStep: number;
  totalSteps: number;
  orientation: "horizontal" | "vertical";
}

function StepperItem({
  step,
  index,
  currentStep,
  totalSteps,
  orientation,
}: StepperItemProps) {
  const status = getStatus(index, currentStep);
  const isLast = index === totalSteps - 1;

  return (
    <li
      className={cn(
        "flex flex-1 gap-3",
        orientation === "horizontal" ? "items-center" : "items-start",
      )}
      aria-current={status === "current" ? "step" : undefined}
    >
      <div className="flex flex-col items-center">
        <motion.span
          layout
          initial={false}
          animate={{
            backgroundColor:
              status === "upcoming"
                ? "hsl(var(--muted))"
                : "hsl(var(--primary))",
            color:
              status === "upcoming"
                ? "hsl(var(--muted-foreground))"
                : "hsl(var(--primary-foreground))",
          }}
          transition={{ duration: 0.2 }}
          className="flex size-8 items-center justify-center rounded-full text-xs font-medium"
        >
          {status === "complete" ? <Check className="size-4" /> : index + 1}
        </motion.span>
        {!isLast && orientation === "vertical" && (
          <span
            className={cn(
              "mt-1 w-px flex-1",
              status === "complete" ? "bg-primary" : "bg-border",
            )}
            aria-hidden
          />
        )}
      </div>

      <div className="flex flex-1 flex-col pt-1">
        <span
          className={cn(
            "text-sm font-medium",
            status === "current" ? "text-foreground" : "text-medium-emphasis",
          )}
        >
          {step.title}
        </span>
        {step.description && (
          <span className="text-xs text-muted-foreground">
            {step.description}
          </span>
        )}
      </div>

      {!isLast && orientation === "horizontal" && (
        <span
          className={cn(
            "h-px flex-1 self-center",
            status === "complete" ? "bg-primary" : "bg-border",
          )}
          aria-hidden
        />
      )}
    </li>
  );
}

const Stepper = React.forwardRef<HTMLOListElement, StepperProps>(
  (
    { steps, currentStep, orientation = "horizontal", className, ...props },
    ref,
  ) => {
    return (
      <ol
        ref={ref}
        aria-label="Progress"
        className={cn(
          "flex w-full",
          orientation === "vertical"
            ? "flex-col gap-4"
            : "flex-row items-start gap-2",
          className,
        )}
        {...props}
      >
        {steps.map((step, index) => (
          <StepperItem
            key={step.id}
            step={step}
            index={index}
            currentStep={currentStep}
            totalSteps={steps.length}
            orientation={orientation}
          />
        ))}
      </ol>
    );
  },
);
Stepper.displayName = "Stepper";

export { Stepper };
