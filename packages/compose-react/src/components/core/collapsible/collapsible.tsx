"use client";

import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { motion, type Transition } from "framer-motion";

const Collapsible = CollapsiblePrimitive.Root;
const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

function useRadixDataState(
  ref: React.RefObject<HTMLElement | null>,
): "open" | "closed" {
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

const collapsibleTransition: Transition = {
  duration: 0.26,
  ease: [0.16, 1, 0.3, 1],
};

const CollapsibleContent = React.forwardRef<
  React.ComponentRef<typeof CollapsiblePrimitive.CollapsibleContent>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleContent>
>(({ className, children, ...props }, ref) => {
  const localRef = React.useRef<HTMLDivElement | null>(null);
  React.useImperativeHandle(ref, () => localRef.current as HTMLDivElement);
  const state = useRadixDataState(localRef);
  const open = state === "open";

  return (
    <CollapsiblePrimitive.CollapsibleContent
      ref={localRef}
      forceMount
      className="overflow-hidden"
      {...props}
    >
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{
          height: collapsibleTransition,
          opacity: { duration: 0.18, ease: [0.4, 0, 0.2, 1] },
        }}
        style={{ overflow: "hidden" }}
      >
        <div className={className}>{children}</div>
      </motion.div>
    </CollapsiblePrimitive.CollapsibleContent>
  );
});
CollapsibleContent.displayName =
  CollapsiblePrimitive.CollapsibleContent.displayName;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
