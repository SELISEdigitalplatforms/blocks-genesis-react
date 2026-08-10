"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  useKeyboardShortcut,
  type KeyboardShortcutCombo,
} from "@/hooks/use-keyboard-shortcut";
import { RightSidePanelContext } from "@/contexts/dashboard-layout/right-side-panel.context";
import type {
  RightSidePanelContextValue,
  RightSidePanelSizing,
} from "@/contexts/dashboard-layout/right-side-panel.types";

const HASH_PREFIX = "#";
const DEFAULT_HASH_KEY = "right-side-panel";

function parseWidth(value: number | string, fallback: string): string {
  if (typeof value === "number") return `${value}px`;
  if (typeof value === "string" && value.trim().length > 0) return value;
  return fallback;
}

export interface RightSidePanelProviderProps {
  children?: React.ReactNode;
  /** Uncontrolled initial open state. Ignored when `open` is provided. */
  defaultOpen?: boolean;
  /** Controlled open state. When defined, `onOpenChange` should also be set. */
  open?: boolean;
  /** Controlled change handler. Required when `open` is provided. */
  onOpenChange?: (open: boolean) => void;
  /** Sync open state to `window.location.hash` (e.g. `#right-side-panel`). Default `true`. */
  syncHash?: boolean;
  /** The hash key (without `#`) used when `syncHash` is enabled. */
  hashKey?: string;
  /** Keyboard shortcut to toggle the panel. `false` disables it. Default `"mod+j"`. */
  shortcut?: KeyboardShortcutCombo;
  /** Resolved CSS length for the panel width on desktop. Default `24rem`. */
  width?: number | string;
  /** Minimum width (CSS length). Default `20rem`. */
  minWidth?: number | string;
  /** Maximum width (CSS length). Default `50vw`. */
  maxWidth?: number | string;
  /** Render a resize handle on the desktop panel's left edge. Default `false`. */
  resizable?: boolean;
  /** Override the auto-generated panel id (used by aria-controls). */
  panelId?: string;
  /** Optional className for the wrapper element that owns the CSS variables. */
  className?: string;
  /** Optional style passthrough for the wrapper element. */
  style?: React.CSSProperties;
}

export function RightSidePanelProvider({
  children,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  syncHash = true,
  hashKey = DEFAULT_HASH_KEY,
  shortcut = "mod+j",
  width = "24rem",
  minWidth = "20rem",
  maxWidth = "50vw",
  resizable = false,
  panelId,
  className,
  style,
}: RightSidePanelProviderProps) {
  const isMobile = useIsMobile();
  const isControlled = openProp !== undefined;
  const generatedId = React.useId();
  const resolvedPanelId = panelId ?? `right-side-panel-${generatedId}`;

  const sizing = React.useMemo<RightSidePanelSizing>(
    () => ({
      width: parseWidth(width, "24rem"),
      minWidth: parseWidth(minWidth, "20rem"),
      maxWidth: parseWidth(maxWidth, "50vw"),
    }),
    [width, minWidth, maxWidth],
  );

  const readHash = React.useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    const hash = window.location.hash.replace(/^#/, "");
    return hash === hashKey || hash.startsWith(`${hashKey}?`);
  }, [hashKey]);

  const [internalOpen, setInternalOpen] = React.useState<boolean>(() => {
    if (isControlled) return Boolean(openProp);
    if (syncHash) {
      const fromHash = readHash();
      return fromHash || defaultOpen;
    }
    return defaultOpen;
  });

  const open = isControlled ? Boolean(openProp) : internalOpen;

  const setOpen = React.useCallback(
    (next: boolean | ((prev: boolean) => boolean)) => {
      const resolved = typeof next === "function" ? next(open) : next;
      if (!isControlled) {
        setInternalOpen(resolved);
      }
      onOpenChange?.(resolved);
    },
    [isControlled, onOpenChange, open],
  );

  const toggle = React.useCallback(() => {
    setOpen((prev) => !prev);
  }, [setOpen]);

  const close = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const [liveWidth, setLiveWidth] = React.useState<string>("0px");

  useKeyboardShortcut(shortcut, toggle);

  React.useEffect(() => {
    if (!syncHash || isControlled || typeof window === "undefined") return;

    const handleHashChange = () => {
      const next = readHash();
      setInternalOpen((prev) => (prev === next ? prev : next));
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [syncHash, isControlled, readHash]);

  React.useEffect(() => {
    if (!syncHash || isControlled || typeof window === "undefined") return;
    const current = window.location.hash.replace(/^#/, "");
    const desired = open ? hashKey : "";
    if (open && current !== hashKey) {
      window.history.replaceState(null, "", `${HASH_PREFIX}${desired}`);
    } else if (!open && current === hashKey) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
  }, [open, syncHash, isControlled, hashKey]);

  React.useEffect(() => {
    setLiveWidth(open ? sizing.width : "0px");
  }, [open, sizing.width]);

  const contextValue = React.useMemo<RightSidePanelContextValue>(
    () => ({
      open,
      setOpen,
      toggle,
      close,
      sizing,
      liveWidth,
      setLiveWidth,
      resizable,
      panelId: resolvedPanelId,
      isMobile,
    }),
    [
      open,
      setOpen,
      toggle,
      close,
      sizing,
      liveWidth,
      resizable,
      resolvedPanelId,
      isMobile,
    ],
  );

  return (
    <RightSidePanelContext.Provider value={contextValue}>
      <div
        data-slot="right-side-panel-provider"
        data-state={open ? "open" : "closed"}
        data-panel-id={resolvedPanelId}
        className={cn("relative w-full", className)}
        style={
          {
            "--right-side-panel-width": open
              ? resizable
                ? liveWidth
                : sizing.width
              : "0px",
            "--right-side-panel-min-width": sizing.minWidth,
            "--right-side-panel-max-width": sizing.maxWidth,
            "--right-side-panel-live-width": liveWidth,
            ...style,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </RightSidePanelContext.Provider>
  );
}
