import { create } from "zustand";
import { COMMON_MODULE } from "./languages";
import common from "./locales/common.en.json";
import genesisConsole from "./locales/genesis.console.en.json";
import genesisDashboard from "./locales/genesis.dashboard.en.json";
import genesisLogin from "./locales/genesis.login.en.json";
import genesisProfile from "./locales/genesis.profile.en.json";
import genesisShared from "./locales/genesis.shared.en.json";
import type { Dictionary } from "./translate";

interface I18nState {
  /** English text shipped with the app, per module. Source of truth for English. */
  bundled: Record<string, Dictionary>;
  /** Published text loaded from the localization service, keyed `<language>:<module>`. */
  remote: Record<string, Dictionary>;
  registerBundle: (module: string, dictionary: Dictionary) => void;
  setRemote: (language: string, module: string, dictionary: Dictionary) => void;
}

export const remoteKey = (language: string, module: string) =>
  `${language}:${module}`;

export const useI18nStore = create<I18nState>()((set) => ({
  // Shared words (Save, Cancel…) every app uses as `common:KEY`.
  bundled: {
    [COMMON_MODULE]: common,
    "genesis.console": genesisConsole,
    "genesis.dashboard": genesisDashboard,
    "genesis.login": genesisLogin,
    "genesis.profile": genesisProfile,
    "genesis.shared": genesisShared,
  },
  remote: {},
  registerBundle: (module, dictionary) =>
    set((state) => ({
      bundled: {
        ...state.bundled,
        [module]: { ...state.bundled[module], ...dictionary },
      },
    })),
  setRemote: (language, module, dictionary) =>
    set((state) => ({
      remote: { ...state.remote, [remoteKey(language, module)]: dictionary },
    })),
}));

/**
 * Registers the bundled English text of a module. Call once per module at app
 * start (for example from `app/i18n/index.ts`), before the first render.
 */
export const registerTranslations = (
  module: string,
  dictionary: Dictionary,
) => {
  useI18nStore.getState().registerBundle(module, dictionary);
};
