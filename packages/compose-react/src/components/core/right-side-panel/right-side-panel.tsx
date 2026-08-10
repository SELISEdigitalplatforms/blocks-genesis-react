"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Drawer as DrawerPrimitive } from "vaul";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRightSidePanel } from "./use-right-side-panel";
import { useLayoutSettingsStore } from "@/store/layout-settings.store";
import { RenderConditionally } from "../render-elements/render-conditionally";
import { RightSidePanelResizer } from "./right-side-panel-resizer";

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
  const {
    open,
    close,
    panelId,
    sizing,
    resizable,
    liveWidth,
    setLiveWidth,
    topOffset,
  } = useRightSidePanel();
  const { setLayoutSetting } = useLayoutSettingsStore();
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (open) {
      container.style.setProperty(
        "--right-side-panel-resolved-width",
        liveWidth,
      );
    } else {
      container.style.removeProperty("--right-side-panel-resolved-width");
    }
  }, [open, liveWidth]);

  const onHandlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      const panel = containerRef.current;
      if (!panel) return;
      const startX = event.clientX;
      const startPx = panel.getBoundingClientRect().width;
      const minPx = parsePx(sizing.minWidth);
      const maxPx = resolveMaxPx(sizing.maxWidth, window.innerWidth);

      const onMove = (e: PointerEvent) => {
        const next = clampWidth(startPx + (startX - e.clientX), minPx, maxPx);
        panel.style.setProperty(
          "--right-side-panel-resolved-width",
          `${next}px`,
        );
        setLiveWidth(`${next}px`);
      };
      const onUp = (e: PointerEvent) => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        const final = clampWidth(startPx + (startX - e.clientX), minPx, maxPx);
        setLayoutSetting("rightSidePanelWidth", `${final}px`);
      };
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    },
    [sizing, setLiveWidth, setLayoutSetting],
  );

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
          aria-hidden={!open}
          className={cn(
            "bg-background fixed bottom-0 right-0 z-50 flex flex-col border-l shadow-lg",
            "transition-transform duration-300 ease-in-out",
            "data-[state=closed]:translate-x-full data-[state=open]:translate-x-0",
            className,
          )}
          style={
            {
              top: topOffset,
              width: `var(--right-side-panel-resolved-width, ${liveWidth})`,
              minWidth: sizing.minWidth,
              maxWidth: sizing.maxWidth,
            } as React.CSSProperties
          }
        >
          {children}
          <RenderConditionally condition={resizable}>
            <RightSidePanelResizer onHandlePointerDown={onHandlePointerDown} />
          </RenderConditionally>
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
