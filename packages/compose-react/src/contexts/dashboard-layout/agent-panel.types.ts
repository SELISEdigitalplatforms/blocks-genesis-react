export type AgentPanelSizing = {
  width: string;
  minWidth: string;
  maxWidth: string;
};

export type AgentPanelContextValue = {
  open: boolean;
  setOpen: (next: boolean | ((prev: boolean) => boolean)) => void;
  toggle: () => void;
  close: () => void;
  sizing: AgentPanelSizing;
  liveWidth: string;
  setLiveWidth: (next: string) => void;
  resizable: boolean;
  panelId: string;
  isMobile: boolean;
};
