import { createContext } from "react";
import type { AgentPanelContextValue } from "./agent-panel.types";

export const defaultAgentPanelContextValue: AgentPanelContextValue = {
  open: false,
  setOpen: () => undefined,
  toggle: () => undefined,
  close: () => undefined,
  sizing: { width: "24rem", minWidth: "20rem", maxWidth: "50vw" },
  liveWidth: "0px",
  setLiveWidth: () => undefined,
  resizable: false,
  panelId: "agent-panel",
  isMobile: false,
};

export const AgentPanelContext = createContext<AgentPanelContextValue>(
  defaultAgentPanelContextValue,
);
