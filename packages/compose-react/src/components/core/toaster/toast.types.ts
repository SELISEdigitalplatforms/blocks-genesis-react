import * as React from "react";

// We'll define the types here without depending on the actual components to avoid circular imports
export type ToastProps = {
  className?: string;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type ToastActionElement = React.ReactElement<{
  altText?: string;
  className?: string;
  asChild?: boolean;
}>;
