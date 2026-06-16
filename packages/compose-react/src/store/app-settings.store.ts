import type { Theme } from "@/hooks/use-theme";
import { CookieStorage } from "@/lib/cookie-storage";
import { create } from "zustand";
import { persist, type PersistStorage } from "zustand/middleware";

const resolveCookieDomain = () => {
  const hostname = new URL(window.location.origin).hostname;
  if (!hostname) return undefined;
  if (hostname === "localhost") return hostname;
  return hostname.split(".").slice(-2).join(".");
};

export interface AppSettings {
  theme: Theme;
  language?: string;
  defaultApp?: string;
  [key: string]: unknown;
}

interface AppSettingsStoreState {
  settings: AppSettings;
  getSettings: () => AppSettings;
  setSettings: (nextSettings: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

type AppSettingsPersistedState = Pick<AppSettingsStoreState, "settings">;
const cookieStorage = new CookieStorage();

const perSistStorage: PersistStorage<AppSettingsPersistedState> = {
  getItem: (name) => {
    const cookie = cookieStorage.getItem(name);
    return cookie ? { state: JSON.parse(cookie) } : null;
  },

  setItem: (name, value) => {
    cookieStorage.setItem(name, JSON.stringify(value.state), {
      expires: APP_SETTINGS_COOKIE_MAX_AGE_SECONDS,
      domain: resolveCookieDomain(),
      path: "/",
      secure: window.location.protocol === "https:",
      sameSite: "Lax",
    });
  },

  removeItem: (name) => {
    cookieStorage.removeItem(name);
  },
};

const APP_SETTINGS_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export const useAppSettingsStore = create<AppSettingsStoreState>()(
  persist(
    (set, get) => ({
      settings: {
        theme: "system",
        language: "en",
      },
      getSettings: () => get().settings,
      setSettings: (nextSettings) => {
        set((state) => ({
          ...state,
          settings: { ...state.settings, ...nextSettings },
        }));
      },
      resetSettings: () => {
        set((state) => ({
          ...state,
          settings: { theme: "system", language: "en" },
        }));
      },
    }),
    {
      name: "app-settings-storage",
      storage: perSistStorage,
    },
  ),
);
