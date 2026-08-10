export type RightSidePanelSizing = {
  width: string;
  minWidth: string;
  maxWidth: string;
};

export type RightSidePanelContextValue = {
  open: boolean;
  setOpen: (next: boolean | ((prev: boolean) => boolean)) => void;
  toggle: () => void;
  close: () => void;
  sizing: RightSidePanelSizing;
  liveWidth: string;
  setLiveWidth: (next: string) => void;
  resizable: boolean;
  panelId: string;
  isMobile: boolean;
};
