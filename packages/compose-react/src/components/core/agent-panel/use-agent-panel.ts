"use client";

import { useContext } from "react";
import {
  AgentPanelContext,
  defaultAgentPanelContextValue,
} from "@/contexts/dashboard-layout/agent-panel.context";
import type { AgentPanelContextValue } from "@/contexts/dashboard-layout/agent-panel.types";

export function useAgentPanel(): AgentPanelContextValue {
  return useContext(AgentPanelContext) ?? defaultAgentPanelContextValue;
}
