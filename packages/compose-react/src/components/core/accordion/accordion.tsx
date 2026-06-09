"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { motion, type Transition } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn("border-b", className)} {...props} />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

/**
 * Subscribes to `data-state` on a Radix element so we can drive framer-motion
 * height animations from it without giving up the primitive's a11y wiring.
 */
function useRadixDataState(ref: React.RefObject<HTMLElement | null>): "open" | "closed" {
  const [state, setState] = React.useState<"open" | "closed">("closed");
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => {
      const s = el.getAttribute("data-state");
      setState(s === "open" ? "open" : "closed");
    };
    read();
    const obs = new MutationObserver(read);
    obs.observe(el, { attributes: true, attributeFilter: ["data-state"] });
    return () => obs.disconnect();
  }, [ref]);
  return state;
}

const accordionTransition: Transition = { duration: 0.28, ease: [0.16, 1, 0.3, 1] };

const AccordionContent = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const localRef = React.useRef<HTMLDivElement | null>(null);
  React.useImperativeHandle(ref, () => localRef.current as HTMLDivElement);
  const state = useRadixDataState(localRef);
  const open = state === "open";

  return (
    <AccordionPrimitive.Content
      ref={localRef}
      forceMount
      className="overflow-hidden text-sm"
      {...props}
    >
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{
          height: accordionTransition,
          opacity: { duration: 0.18, ease: [0.4, 0, 0.2, 1] },
        }}
        style={{ overflow: "hidden" }}
      >
        <div className={cn("pb-4 pt-0", className)}>{children}</div>
      </motion.div>
    </AccordionPrimitive.Content>
  );
});
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
