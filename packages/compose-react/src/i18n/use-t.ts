import { useCallback, useEffect } from "react";
import { useAppSettingsStore } from "@/store/app-settings.store";
import {
  COMMON_MODULE,
  DEFAULT_LANGUAGE,
  loadLanguages,
  resolveLanguage,
  resolveLanguageIn,
  useLanguagesStore,
} from "./languages";
import { remoteKey, useI18nStore } from "./i18n.store";
import { loadModule } from "./load-module";
import {
  translate,
  type Dictionary,
  type DictionarySource,
  type TranslateValues,
} from "./translate";

export type TFunction = (key: string, values?: TranslateValues) => string;

const NAMESPACE_SEPARATOR = ":";

/** `common:SAVE` → module `common`, key `SAVE`; `SAVE` → the given module. */
export const splitKey = (module: string, key: string) => {
  const at = key.indexOf(NAMESPACE_SEPARATOR);
  return at > 0
    ? { module: key.slice(0, at), key: key.slice(at + 1) }
    : { module, key };
};

const buildSources = (
  language: string,
  remote?: Dictionary,
  bundled?: Dictionary,
): DictionarySource[] =>
  language === DEFAULT_LANGUAGE
    ? [{ language, dictionary: bundled }]
    : [
        { language, dictionary: remote },
        { language: DEFAULT_LANGUAGE, dictionary: bundled },
      ];

const translateIn = (
  maps: Pick<ReturnType<typeof useI18nStore.getState>, "bundled" | "remote">,
  language: string,
  module: string,
  key: string,
  values?: TranslateValues,
) => {
  const target = splitKey(module, key);
  return translate(
    buildSources(
      language,
      maps.remote[remoteKey(language, target.module)],
      maps.bundled[target.module],
    ),
    target.key,
    values,
  );
};

/** The language the UI shows now (`en`, `de`, …): the user's choice if the project offers it, else the project's default. */
export const useLanguageCode = () => {
  const stored = useAppSettingsStore((state) => state.settings.language);
  const languages = useLanguagesStore((state) => state.languages);
  const loaded = useLanguagesStore((state) => state.loaded);
  useEffect(() => {
    void loadLanguages();
  }, []);
  return resolveLanguageIn(stored, languages, loaded);
};

/** Keeps `<html lang>` on the language the UI shows, for screen readers and browser translation. */
export const useDocumentLanguage = () => {
  const language = useLanguageCode();
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);
  return language;
};

export const getLanguageCode = () =>
  resolveLanguage(useAppSettingsStore.getState().settings.language);

/**
 * Text for one module (`<repo>.<feature>`). Keys of the shared module are
 * written `common:KEY`. Loads the published text for the chosen language and
 * falls back to the bundled English while it loads or when it fails.
 */
export const useT = (module: string) => {
  const language = useLanguageCode();
  // Whole maps: a component re-renders when any module's text arrives (rare).
  const bundled = useI18nStore((state) => state.bundled);
  const remote = useI18nStore((state) => state.remote);

  useEffect(() => {
    void loadModule(language, module);
    void loadModule(language, COMMON_MODULE);
  }, [language, module]);

  const t = useCallback<TFunction>(
    (key, values) => {
      // A key of another module (`other.module:KEY`) needs that module's text too; the
      // request is made once per session, and its arrival re-renders through `remote`.
      const target = splitKey(module, key);
      if (target.module !== module && target.module !== COMMON_MODULE) {
        void loadModule(language, target.module);
      }
      return translateIn({ bundled, remote }, language, module, key, values);
    },
    [bundled, remote, language, module],
  );

  return { t, language };
};

/**
 * Text outside React (constants, schemas, table columns). Call it when the
 * value is used, never at import time, or a language change is missed.
 */
export const tStatic = (
  module: string,
  key: string,
  values?: TranslateValues,
): string => {
  const language = getLanguageCode();
  const target = splitKey(module, key);
  void loadModule(language, target.module);
  return translateIn(useI18nStore.getState(), language, module, key, values);
};
