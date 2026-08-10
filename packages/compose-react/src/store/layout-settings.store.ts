import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface LayoutSettings {
  isLeftSidebarOpen?: boolean;
  leftSidebarWidth?: string;
  rightSidePanelWidth?: string;
}

interface LayoutSettingsStoreState {
  layout: LayoutSettings;
  setLayoutSetting: <K extends keyof LayoutSettings>(
    key: K,
    value: LayoutSettings[K],
  ) => void;
  resetLayout: () => void;
}

export const useLayoutSettingsStore = create<LayoutSettingsStoreState>()(
  persist(
    (set) => ({
      layout: {},
      setLayoutSetting: (key, value) =>
        set((state) => ({
          layout: { ...state.layout, [key]: value },
        })),
      resetLayout: () => set({ layout: {} }),
    }),
    {
      name: "layout-settings",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
