"use client";

import * as React from "react";
import { MessageSquare } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { Button } from "@/components/core/button";
import { useAgentPanel } from "./use-agent-panel";

export type AgentPanelTriggerPosition =
  "bottom-right" | "bottom-left" | "inline";

export interface AgentPanelTriggerProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  asChild?: boolean;
  position?: AgentPanelTriggerPosition;
  icon?: React.ReactNode;
  label?: string;
  /** Shortcut for `aria-label`. */
  ariaLabel?: string;
  children?: React.ReactNode;
}

const positionClasses: Record<AgentPanelTriggerPosition, string> = {
  "bottom-right":
    "fixed bottom-4 right-4 z-40 rounded-full shadow-lg transition-[right] duration-300 ease-in-out data-[state=open]:right-[var(--agent-panel-width,0px)]",
  "bottom-left":
    "fixed bottom-4 left-4 z-40 rounded-full shadow-lg transition-[left] duration-300 ease-in-out data-[state=open]:left-[var(--agent-panel-width,0px)]",
  inline: "relative",
};

export const AgentPanelTrigger = React.forwardRef<
  HTMLButtonElement,
  AgentPanelTriggerProps
>(
  (
    {
      asChild = false,
      position = "bottom-right",
      icon,
      label,
      ariaLabel,
      className,
      children,
      onClick,
      type,
      ...props
    },
    ref,
  ) => {
    const { open, toggle, panelId } = useAgentPanel();
    const Comp = asChild ? Slot : Button;
    const isFloating = position !== "inline";
    const computedLabel = ariaLabel ?? label ?? "Toggle AI assistant";

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) toggle();
    };

    return (
      <Comp
        ref={ref as React.Ref<HTMLButtonElement>}
        type={asChild ? undefined : (type ?? "button")}
        data-slot="agent-panel-trigger"
        data-state={open ? "open" : "closed"}
        aria-label={computedLabel}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={handleClick}
        className={cn(
          isFloating && positionClasses[position],
          !isFloating &&
            "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
          className,
        )}
        {...(props as object)}
      >
        {children ?? (
          <>
            {icon ?? <MessageSquare className="h-5 w-5" aria-hidden />}
            <span className="sr-only">{computedLabel}</span>
          </>
        )}
      </Comp>
    );
  },
);
AgentPanelTrigger.displayName = "AgentPanelTrigger";
