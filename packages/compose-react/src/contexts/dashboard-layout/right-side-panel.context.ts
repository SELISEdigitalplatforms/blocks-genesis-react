import { createContext } from "react";
import type { RightSidePanelContextValue } from "./right-side-panel.types";

export const defaultRightSidePanelContextValue: RightSidePanelContextValue = {
  open: false,
  setOpen: () => undefined,
  toggle: () => undefined,
  close: () => undefined,
  sizing: { width: "24rem", minWidth: "20rem", maxWidth: "50vw" },
  liveWidth: "0px",
  setLiveWidth: () => undefined,
  resizable: false,
  panelId: "right-side-panel",
  isMobile: false,
  topOffset: "0px",
};

export const RightSidePanelContext = createContext<RightSidePanelContextValue>(
  defaultRightSidePanelContextValue,
);
