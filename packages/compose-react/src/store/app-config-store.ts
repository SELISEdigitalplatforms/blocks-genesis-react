import { createStore } from "zustand";

export interface AppConfig {
  envPrefix?: string;
  loginInitiateUrl?: string;
  projectBaseUrlKey?: string;
  userBaseUrlKey?: string;
  appLogoUrl?:
    | {
        dark?: string;
        light?: string;
      }
    | string;
}

export interface AppConfigStoreState {
  config: AppConfig;
  getConfig: () => AppConfig;
  setConfig: (nextConfig: Partial<AppConfig>) => void;
  resetConfig: () => void;
}

export const CreateAppConfigStore = (initialConfig?: Partial<AppConfig>) =>
  createStore<AppConfigStoreState>()((set, get) => ({
    config: { ...initialConfig },
    getConfig: () => get().config,
    setConfig: (nextConfig) => {
      set((state) => ({
        ...state,
        config: { ...state.config, ...nextConfig },
      }));
    },
    resetConfig: () => {
      set((state) => ({ ...state, config: { loginInitiateUrl: undefined } }));
    },
  }));
