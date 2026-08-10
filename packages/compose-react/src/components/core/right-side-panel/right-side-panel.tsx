"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Drawer as DrawerPrimitive } from "vaul";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRightSidePanel } from "./use-right-side-panel";

type RenderPropArg = { close: () => void; open: boolean };

export interface RightSidePanelProps {
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

function clampWidth(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function resolveMaxPx(maxWidth: string, viewportWidth: number): number {
  if (typeof window === "undefined") return 0;
  if (maxWidth.endsWith("vw")) {
    return (parseFloat(maxWidth) / 100) * viewportWidth;
  }
  return parsePx(maxWidth);
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
}: Pick<RightSidePanelProps, "className" | "ariaLabel" | "children" | "id">) {
  const { open, close, panelId, sizing, resizable, setLiveWidth } =
    useRightSidePanel();
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!resizable) return;
    const node = containerRef.current;
    if (!node) return;
    const handle = node.querySelector<HTMLElement>("[data-resize-handle]");
    if (!handle) return;

    let startX = 0;
    let startPx = 0;
    let widthPx = 0;
    let captured = false;

    const minPx = parsePx(sizing.minWidth);
    const maxPx = resolveMaxPx(sizing.maxWidth, window.innerWidth);

    const onMove = (event: PointerEvent) => {
      const delta = startX - event.clientX;
      const next = clampWidth(startPx + delta, minPx, maxPx);
      widthPx = next;
      // Direct DOM mutation — bypasses portal boundary, no React re-render needed
      node.style.setProperty("--right-side-panel-resolved-width", `${next}px`);
      // Still needed: updates --right-side-panel-width on the wrapper div,
      // which the main content margin CAN read (it's inside the wrapper, not portalled)
      setLiveWidth(`${next}px`);
    };

    const onUp = (event: PointerEvent) => {
      try {
        if (captured && handle.hasPointerCapture(event.pointerId)) {
          handle.releasePointerCapture(event.pointerId);
        }
      } catch {
        // ignore
      }
      captured = false;
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
      node.style.setProperty(
        "--right-side-panel-resolved-width",
        `${widthPx}px`,
      );
    };

    const onDown = (event: PointerEvent) => {
      event.preventDefault();
      const rect = node.getBoundingClientRect();
      startX = event.clientX;
      startPx = rect.width;
      widthPx = startPx;
      try {
        handle.setPointerCapture(event.pointerId);
        captured = true;
      } catch {
        captured = false;
      }
      handle.addEventListener("pointermove", onMove);
      handle.addEventListener("pointerup", onUp);
      handle.addEventListener("pointercancel", onUp);
    };

    handle.addEventListener("pointerdown", onDown);
    return () => {
      handle.removeEventListener("pointerdown", onDown);
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
    };
  }, [resizable, sizing, setLiveWidth]);

  React.useEffect(() => {
    if (!open && containerRef.current) {
      containerRef.current.style.removeProperty(
        "--right-side-panel-resolved-width",
      );
    }
  }, [open]);
  return (
    <DialogPrimitive.Root
      modal={false}
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content
          forceMount
          aria-modal={false}
          id={id ?? panelId}
          ref={containerRef}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          onFocusOutside={(e) => e.preventDefault()}
          data-slot="right-side-panel"
          data-state={open ? "open" : "closed"}
          aria-label={ariaLabel ?? "Side panel"}
          className={cn(
            "bg-background fixed inset-y-0 right-0 z-50 flex h-full flex-col border-l shadow-lg",
            "transition-transform duration-300 ease-in-out",
            "data-[state=closed]:translate-x-full data-[state=open]:translate-x-0",
            className,
          )}
          style={
            {
              width: `var(--right-side-panel-resolved-width, var(--right-side-panel-width, ${sizing.width}))`,
              minWidth: sizing.minWidth,
              maxWidth: sizing.maxWidth,
            } as React.CSSProperties
          }
        >
          {children}
          {resizable && (
            <div
              data-resize-handle
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize panel"
              className="bg-border hover:bg-primary/50 absolute inset-y-0 -left-0.5 w-1.5 cursor-ew-resize touch-none transition-colors"
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
}: Pick<RightSidePanelProps, "ariaLabel" | "children" | "className" | "id">) {
  const { open, close, panelId } = useRightSidePanel();
  return (
    <DrawerPrimitive.Root
      modal={false}
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80" />
        <DrawerPrimitive.Content
          id={id ?? panelId}
          data-slot="right-side-panel"
          data-state={open ? "open" : "closed"}
          aria-label={ariaLabel ?? "Side panel"}
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

export function RightSidePanel({
  ariaLabel,
  className,
  children,
  content,
  id,
}: RightSidePanelProps) {
  const ctx = useRightSidePanel();
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
RightSidePanel.displayName = "RightSidePanel";

const RightSidePanelHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="right-side-panel-header"
    className={cn(
      "flex shrink-0 items-start justify-between gap-3 border-b p-4",
      className,
    )}
    {...props}
  />
));
RightSidePanelHeader.displayName = "RightSidePanelHeader";

const RightSidePanelTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    data-slot="right-side-panel-title"
    className={cn(
      "text-base font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
RightSidePanelTitle.displayName = "RightSidePanelTitle";

const RightSidePanelDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="right-side-panel-description"
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
));
RightSidePanelDescription.displayName = "RightSidePanelDescription";

const RightSidePanelClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { isMobile, close } = useRightSidePanel();
  const Comp = isMobile ? DrawerPrimitive.Close : DialogPrimitive.Close;
  return (
    <Comp
      ref={ref as React.Ref<HTMLButtonElement>}
      data-slot="right-side-panel-close"
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
RightSidePanelClose.displayName = "RightSidePanelClose";

const RightSidePanelBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="right-side-panel-body"
    className={cn("min-h-0 flex-1 overflow-y-auto p-4", className)}
    {...props}
  />
));
RightSidePanelBody.displayName = "RightSidePanelBody";

const RightSidePanelFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="right-side-panel-footer"
    className={cn("shrink-0 border-t p-4", className)}
    {...props}
  />
));
RightSidePanelFooter.displayName = "RightSidePanelFooter";

export {
  RightSidePanelHeader,
  RightSidePanelTitle,
  RightSidePanelDescription,
  RightSidePanelClose,
  RightSidePanelBody,
  RightSidePanelFooter,
};
