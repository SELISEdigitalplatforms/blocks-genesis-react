"use client";

import { useContext } from "react";
import {
  RightSidePanelContext,
  defaultRightSidePanelContextValue,
} from "@/contexts/dashboard-layout/right-side-panel.context";
import type { RightSidePanelContextValue } from "@/contexts/dashboard-layout/right-side-panel.types";

export function useRightSidePanel(): RightSidePanelContextValue {
  return useContext(RightSidePanelContext) ?? defaultRightSidePanelContextValue;
}
