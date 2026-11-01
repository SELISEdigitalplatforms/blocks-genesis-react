export interface SupportedLanguage {
  /** Code the apps store and show (`en`, `de`). */
  code: string;
  /** Culture code of the language in the localization service (`de-DE`). */
  culture: string;
  title: string;
}

export const DEFAULT_LANGUAGE = "en";
export const COMMON_MODULE = "common";

export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = [
  { code: "en", culture: "en-US", title: "English" },
  { code: "de", culture: "de-DE", title: "Deutsch" },
];

export const resolveLanguage = (language?: string | null): string => {
  const code = language?.toLowerCase().split("-")[0];
  return SUPPORTED_LANGUAGES.some((item) => item.code === code)
    ? (code as string)
    : DEFAULT_LANGUAGE;
};

/** Culture code the localization service uses for an app language. */
export const cultureOf = (language: string): string =>
  SUPPORTED_LANGUAGES.find((item) => item.code === language)?.culture ??
  language;
