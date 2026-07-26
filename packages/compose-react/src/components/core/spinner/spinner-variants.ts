import { cva } from "class-variance-authority";

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

export { spinnerVariants };
