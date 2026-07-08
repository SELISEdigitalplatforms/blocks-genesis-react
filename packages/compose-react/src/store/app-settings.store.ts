import type { Theme } from "@/lib/theme";
import { getSystemTheme } from "@/lib/theme";
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
  // Non-persisted — tracks app preference reactively, not stored in cookie
  systemTheme: Exclude<Theme, "system">;
  getSettings: () => AppSettings;
  setSettings: (nextSettings: Partial<AppSettings>) => void;
  setSystemTheme: (systemTheme: Exclude<Theme, "system">) => void;
  resetSettings: () => void;
}

// Only `settings` goes into the cookie — systemTheme and actions are excluded
type AppSettingsPersistedState = Pick<AppSettingsStoreState, "settings">;

const cookieStorage = new CookieStorage();
const APP_SETTINGS_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const persistStorage: PersistStorage<AppSettingsPersistedState> = {
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

export const useAppSettingsStore = create<AppSettingsStoreState>()(
  persist(
    (set, get) => ({
      settings: {
        theme: "system",
        language: "en",
      },
      // Initialized from app at store creation — correct on first render
      systemTheme: getSystemTheme(),
      getSettings: () => get().settings,
      setSettings: (nextSettings) => {
        set((state) => ({
          ...state,
          settings: { ...state.settings, ...nextSettings },
        }));
      },
      setSystemTheme: (systemTheme) => {
        set((state) => ({ ...state, systemTheme }));
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
      storage: persistStorage,
      // Explicit partialize keeps systemTheme and actions out of the cookie
      partialize: (state) => ({ settings: state.settings }),
    },
  ),
);
