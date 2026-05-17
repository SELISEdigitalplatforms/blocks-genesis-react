import * as React from "react";
import { Loader2 } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@blocks-kit/ui/lib/utils";

/**
 * Blocks `Spinner` — uses `--loader-color` so it adapts to light / dark
 * automatically. Sizes follow the spec (sm / md / lg).
 */
const spinnerVariants = cva("animate-spin", {
  variants: {
    size: {
      sm: "size-4",
      md: "size-6",
      lg: "size-8",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface SpinnerProps
  extends React.SVGAttributes<SVGSVGElement>, VariantProps<typeof spinnerVariants> {
  /** Optional label exposed to assistive tech via `aria-label`. */
  label?: string;
}

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size, label = "Loading", style, ...props }, ref) => (
    <Loader2
      ref={ref}
      role="status"
      aria-label={label}
      className={cn(spinnerVariants({ size }), className)}
      style={{ color: "var(--loader-color)", ...style }}
      {...props}
    />
  ),
);
Spinner.displayName = "Spinner";

export { Spinner, spinnerVariants };
