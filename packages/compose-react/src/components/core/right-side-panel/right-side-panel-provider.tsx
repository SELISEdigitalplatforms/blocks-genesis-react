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
import { useLayoutSettingsStore } from "@/store/layout-settings.store";

const HASH_PREFIX = "#";
const DEFAULT_HASH_KEY = "right-side-panel";
const DEFAULT_SIZING_VALUES = {
  width: "24rem",
  minWidth: "20rem",
  maxWidth: "50vw",
};

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
  /** Keyboard shortcut to toggle the panel. `false` disables it. Default `"mod+."`. */
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
  /** Optional top offset for the panel (in pixels). Default `0px`. */
  topOffset?: number | string;
}

export function RightSidePanelProvider({
  children,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  syncHash = true,
  hashKey = DEFAULT_HASH_KEY,
  shortcut = "mod+.",
  width = DEFAULT_SIZING_VALUES.width,
  minWidth = DEFAULT_SIZING_VALUES.minWidth,
  maxWidth = DEFAULT_SIZING_VALUES.maxWidth,
  resizable = false,
  panelId,
  className,
  style,
  topOffset = "0px",
}: RightSidePanelProviderProps) {
  const isMobile = useIsMobile();
  const isControlled = openProp !== undefined;
  const generatedId = React.useId();
  const resolvedPanelId = panelId ?? `right-side-panel-${generatedId}`;
  const resolvedTopOffset = parseWidth(topOffset, "0px");

  const { layout } = useLayoutSettingsStore();

  const sizing = React.useMemo<RightSidePanelSizing>(
    () => ({
      width: parseWidth(width, DEFAULT_SIZING_VALUES.width),
      minWidth: parseWidth(minWidth, DEFAULT_SIZING_VALUES.minWidth),
      maxWidth: parseWidth(maxWidth, DEFAULT_SIZING_VALUES.maxWidth),
    }),
    [width, minWidth, maxWidth],
  );
  const [liveWidth, setLiveWidth] = React.useState<string>(
    () => layout.rightSidePanelWidth ?? sizing.width,
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

  // Add this effect. Zustand's persist fires a store update when it finishes
  // rehydrating, which re-renders this component and triggers this effect.
  // It also fires on every drag-end (setLayoutSetting call), but that's a
  // no-op because the value is already identical to liveWidth.
  React.useEffect(() => {
    if (layout.rightSidePanelWidth) {
      setLiveWidth(layout.rightSidePanelWidth);
    }
  }, [layout.rightSidePanelWidth]);

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
      topOffset: resolvedTopOffset,
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
      resolvedTopOffset,
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
