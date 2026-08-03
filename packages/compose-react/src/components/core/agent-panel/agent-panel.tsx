"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Drawer as DrawerPrimitive } from "vaul";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAgentPanel } from "./use-agent-panel";

type RenderPropArg = { close: () => void; open: boolean };

export interface AgentPanelProps {
  /** Accessible label for the panel content. */
  ariaLabel?: string;
  /** Render the entire panel via this function. Receives `{ close, open }`. */
  content?: (arg: RenderPropArg) => React.ReactNode;
  /** Optional className for the desktop panel container. */
  className?: string;
  /** Children (slots) — ignored when `content` is provided. */
  children?: React.ReactNode;
  /** Optional id used by aria-controls. Defaults to context `panelId`. */
  id?: string;
}

function clampWidth(
  value: number,
  sizing: { minWidth: string; maxWidth: string },
): number {
  if (typeof window === "undefined") return value;
  const min = parsePx(sizing.minWidth);
  const maxRaw = sizing.maxWidth.endsWith("vw")
    ? (parseFloat(sizing.maxWidth) / 100) * window.innerWidth
    : parsePx(sizing.maxWidth);
  return Math.max(min, Math.min(maxRaw, value));
}

function parsePx(value: string): number {
  if (typeof window === "undefined") return 0;
  const probe = document.createElement("div");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.width = value;
  document.body.appendChild(probe);
  const px = probe.getBoundingClientRect().width;
  document.body.removeChild(probe);
  return px;
}

function DesktopPanel({
  className,
  ariaLabel,
  children,
  id,
}: Pick<AgentPanelProps, "className" | "ariaLabel" | "children" | "id">) {
  const { open, close, panelId, sizing, resizable, setLiveWidth } =
    useAgentPanel();
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!resizable) return;
    const node = containerRef.current;
    if (!node) return;

    let startX = 0;
    let startPx = 0;
    let widthPx = parsePx(sizing.width);

    const onMove = (event: PointerEvent) => {
      const delta = startX - event.clientX;
      const next = clampWidth(startPx + delta, sizing);
      widthPx = next;
      setLiveWidth(`${next}px`);
    };

    const onUp = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      node.style.setProperty("--agent-panel-resolved-width", `${widthPx}px`);
    };

    const onDown = (event: PointerEvent) => {
      event.preventDefault();
      startX = event.clientX;
      const rect = node.getBoundingClientRect();
      startPx = rect.width;
      widthPx = startPx;
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    };

    const handle = node.querySelector<HTMLElement>("[data-resize-handle]");
    if (!handle) return;
    handle.addEventListener("pointerdown", onDown);
    return () => {
      handle.removeEventListener("pointerdown", onDown);
    };
  }, [resizable, sizing, setLiveWidth]);

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content
          id={id ?? panelId}
          ref={containerRef}
          data-slot="agent-panel"
          data-state={open ? "open" : "closed"}
          aria-label={ariaLabel ?? "AI assistant"}
          className={cn(
            "bg-background fixed inset-y-0 right-0 z-50 flex h-full flex-col border-l shadow-lg",
            "transition-[transform,width] duration-300 ease-in-out",
            "data-[state=closed]:translate-x-full data-[state=open]:translate-x-0",
            className,
          )}
          style={
            {
              width: `var(--agent-panel-resolved-width, ${sizing.width})`,
              minWidth: sizing.minWidth,
              maxWidth: sizing.maxWidth,
            } as React.CSSProperties
          }
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
        >
          {children}
          {resizable && (
            <div
              data-resize-handle
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize panel"
              className="bg-border hover:bg-primary/50 absolute inset-y-0 left-0 w-1 cursor-ew-resize touch-none transition-colors"
            />
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function MobilePanel({
  ariaLabel,
  children,
  className,
  id,
}: Pick<AgentPanelProps, "ariaLabel" | "children" | "className" | "id">) {
  const { open, close, panelId } = useAgentPanel();
  return (
    <DrawerPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80" />
        <DrawerPrimitive.Content
          id={id ?? panelId}
          data-slot="agent-panel"
          data-state={open ? "open" : "closed"}
          aria-label={ariaLabel ?? "AI assistant"}
          className={cn(
            "bg-background fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto max-h-[90vh] flex-col rounded-t-[10px] border",
            className,
          )}
        >
          <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
          {children}
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  );
}

export function AgentPanel({
  ariaLabel,
  className,
  children,
  content,
  id,
}: AgentPanelProps) {
  const ctx = useAgentPanel();
  const body = content
    ? content({ close: ctx.close, open: ctx.open })
    : children;

  if (ctx.isMobile) {
    return (
      <MobilePanel ariaLabel={ariaLabel} className={className} id={id}>
        {body}
      </MobilePanel>
    );
  }
  return (
    <DesktopPanel ariaLabel={ariaLabel} className={className} id={id}>
      {body}
    </DesktopPanel>
  );
}
AgentPanel.displayName = "AgentPanel";

const AgentPanelHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="agent-panel-header"
    className={cn(
      "flex shrink-0 items-start justify-between gap-3 border-b p-4",
      className,
    )}
    {...props}
  />
));
AgentPanelHeader.displayName = "AgentPanelHeader";

const AgentPanelTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    data-slot="agent-panel-title"
    className={cn(
      "text-base font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
AgentPanelTitle.displayName = "AgentPanelTitle";

const AgentPanelDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="agent-panel-description"
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
));
AgentPanelDescription.displayName = "AgentPanelDescription";

const AgentPanelClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { isMobile, close } = useAgentPanel();
  const Comp = isMobile ? DrawerPrimitive.Close : DialogPrimitive.Close;
  return (
    <Comp
      ref={ref as React.Ref<HTMLButtonElement>}
      data-slot="agent-panel-close"
      aria-label="Close panel"
      className={cn(
        "ring-offset-background focus:ring-ring rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2",
        className,
      )}
      onClick={(event) => {
        props.onClick?.(event);
        if (!event.defaultPrevented) close();
      }}
      {...props}
    >
      <X className="h-4 w-4" aria-hidden />
      <span className="sr-only">Close</span>
    </Comp>
  );
});
AgentPanelClose.displayName = "AgentPanelClose";

const AgentPanelBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="agent-panel-body"
    className={cn("min-h-0 flex-1 overflow-y-auto p-4", className)}
    {...props}
  />
));
AgentPanelBody.displayName = "AgentPanelBody";

const AgentPanelFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="agent-panel-footer"
    className={cn("shrink-0 border-t p-4", className)}
    {...props}
  />
));
AgentPanelFooter.displayName = "AgentPanelFooter";

export {
  AgentPanelHeader,
  AgentPanelTitle,
  AgentPanelDescription,
  AgentPanelClose,
  AgentPanelBody,
  AgentPanelFooter,
};
