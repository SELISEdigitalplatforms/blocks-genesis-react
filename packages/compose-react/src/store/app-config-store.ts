import { createStore } from "zustand";

type Name = 'blocks-os' | 'blocks-utilities' | 'blocks-logic' | 'blocks-monitor' | 'blocks-release' | 'blocks-iam' | 'blocks-studio' | 'blocks-agents' | 'blocks-data';

export interface AppConfig {
  name: Name;
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
    config: { name: 'blocks-os', ...initialConfig },
    getConfig: () => get().config,
    setConfig: (nextConfig) => {
      set((state) => ({
        ...state,
        config: { ...state.config, ...nextConfig },
      }));
    },
    resetConfig: () => {
      set((state) => ({ ...state, config: { name: 'blocks-os', loginInitiateUrl: undefined } }));
    },
  }));
