import { create } from "zustand";
import {
  fetchFromLocalization,
  i18nConfig,
  isLocalizationConfigured,
} from "./config";

export interface SupportedLanguage {
  /** Code the apps store and show (`en`, `de`): the culture's language part. */
  code: string;
  /** Culture code of the language in the localization service (`de-DE`). */
  culture: string;
  title: string;
  /** The project's default language. */
  isDefault?: boolean;
}

/** Language of the text bundled in the apps; it is never fetched. */
export const DEFAULT_LANGUAGE = "en";
export const COMMON_MODULE = "common";

const ENGLISH: SupportedLanguage = {
  code: DEFAULT_LANGUAGE,
  culture: "en-US",
  title: "English",
};

/** Shown until the project's languages are known, and when the service cannot be reached. */
export const FALLBACK_LANGUAGES: readonly SupportedLanguage[] = [ENGLISH];

/**
 * @deprecated The languages come from the project (`useLanguagesStore`). Kept for apps
 * that still render their own selector from it.
 */
export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = [
  ENGLISH,
  { code: "de", culture: "de-DE", title: "Deutsch" },
];

// Culture to use for a language before the project's list is known.
const KNOWN_CULTURES: Readonly<Record<string, string>> = {
  en: "en-US",
  de: "de-DE",
};

const CACHE_KEY = "blocks-i18n:languages";

/** `de-DE` → `de`. */
export const toLanguageCode = (culture: string): string =>
  culture.trim().toLowerCase().split(/[-_]/)[0] ?? "";

interface LanguagesState {
  languages: readonly SupportedLanguage[];
  /** True once the project's list is known (from the service or the cache). */
  loaded: boolean;
  setLanguages: (languages: readonly SupportedLanguage[]) => void;
}

export const useLanguagesStore = create<LanguagesState>()((set) => ({
  languages: FALLBACK_LANGUAGES,
  loaded: false,
  setLanguages: (languages) => set({ languages, loaded: true }),
}));

const readField = (item: Record<string, unknown>, name: string): unknown =>
  item[name] ?? item[name.charAt(0).toUpperCase() + name.slice(1)];

/**
 * Turns the service's languages (`{ languageName, languageCode, isDefault }`, either casing)
 * into the app list: one entry per language code (the project's default culture wins, then
 * the first one), English always present because the apps ship English.
 */
export const toProjectLanguages = (
  value: unknown,
): SupportedLanguage[] | null => {
  if (!Array.isArray(value)) return null;
  const byCode = new Map<string, SupportedLanguage>();
  for (const raw of value) {
    if (typeof raw !== "object" || raw === null) continue;
    const item = raw as Record<string, unknown>;
    const culture = readField(item, "languageCode");
    if (typeof culture !== "string" || !culture.trim()) continue;
    const code = toLanguageCode(culture);
    if (!code) continue;
    const name = readField(item, "languageName");
    const language: SupportedLanguage = {
      code,
      culture: culture.trim(),
      title:
        typeof name === "string" && name.trim()
          ? name.trim()
          : code.toUpperCase(),
      isDefault: readField(item, "isDefault") === true,
    };
    const known = byCode.get(code);
    if (!known || (language.isDefault && !known.isDefault)) {
      byCode.set(code, language);
    }
  }
  if (byCode.size === 0) return null;
  if (!byCode.has(DEFAULT_LANGUAGE)) byCode.set(DEFAULT_LANGUAGE, ENGLISH);
  return [...byCode.values()];
};

const readCache = (): SupportedLanguage[] | null => {
  try {
    const raw = globalThis.localStorage?.getItem(CACHE_KEY);
    return raw ? toProjectLanguages(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
};

const writeCache = (languages: readonly SupportedLanguage[]) => {
  try {
    globalThis.localStorage?.setItem(
      CACHE_KEY,
      JSON.stringify(
        languages.map((item) => ({
          languageCode: item.culture,
          languageName: item.title,
          isDefault: item.isDefault === true,
        })),
      ),
    );
  } catch {
    // Storage full or blocked: the list still works for this session.
  }
};

let pending: Promise<void> | null = null;

/** Test helper: forgets the loaded list. */
export const resetLanguages = () => {
  pending = null;
  useLanguagesStore.setState({ languages: FALLBACK_LANGUAGES, loaded: false });
};

/**
 * Loads the project's languages (`/api/Language/Gets` with the project key) once per page
 * session. The cached list shows at once; a failed request keeps the cache or English only,
 * and is tried again later.
 */
export const loadLanguages = (): Promise<void> => {
  if (pending) return pending;
  pending = (async () => {
    const cached = readCache();
    if (cached) useLanguagesStore.getState().setLanguages(cached);
    if (!isLocalizationConfigured()) return;
    try {
      const text = await fetchFromLocalization("/api/Language/Gets");
      const fresh = text ? toProjectLanguages(JSON.parse(text)) : null;
      if (!fresh) throw new Error("No languages for the project");
      useLanguagesStore.getState().setLanguages(fresh);
      writeCache(fresh);
    } catch {
      setTimeout(() => {
        pending = null;
      }, i18nConfig().retryAfterMs);
    }
  })();
  return pending;
};

/** The language the UI starts in: the project's default, else English. */
export const defaultLanguageIn = (
  languages: readonly SupportedLanguage[],
): string => languages.find((item) => item.isDefault)?.code ?? DEFAULT_LANGUAGE;

/**
 * The language to show for a stored choice. Before the project's list is known any code is
 * kept (its text falls back to English if missing); afterwards a language the project does
 * not offer, or no choice at all, gives the project's default.
 */
export const resolveLanguageIn = (
  language: string | null | undefined,
  languages: readonly SupportedLanguage[],
  loaded: boolean,
): string => {
  const code = language ? toLanguageCode(language) : "";
  if (code && (!loaded || languages.some((item) => item.code === code))) {
    return code;
  }
  return defaultLanguageIn(languages);
};

export const resolveLanguage = (language?: string | null): string => {
  const { languages, loaded } = useLanguagesStore.getState();
  return resolveLanguageIn(language, languages, loaded);
};

/** Culture code the localization service uses for an app language (`de` → `de-DE`). */
export const cultureOf = (language: string): string =>
  useLanguagesStore.getState().languages.find((item) => item.code === language)
    ?.culture ??
  KNOWN_CULTURES[language] ??
  language;
