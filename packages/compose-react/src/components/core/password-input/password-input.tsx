import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/core/input";

export interface PasswordInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  /** Pass-through for the visibility toggle button aria-label. */
  toggleAriaLabel?: string;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    { className, toggleAriaLabel = "Toggle password visibility", ...props },
    ref,
  ) => {
    const [visible, setVisible] = React.useState(false);
    const Icon = visible ? EyeOff : Eye;

    return (
      <div className={cn("relative", className)}>
        <Input
          {...props}
          ref={ref}
          type={visible ? "text" : "password"}
          className="pr-10"
        />
        <button
          type="button"
          aria-label={toggleAriaLabel}
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Icon className="size-4" />
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
