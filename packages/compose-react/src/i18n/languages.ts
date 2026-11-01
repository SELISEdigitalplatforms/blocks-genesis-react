export interface SupportedLanguage {
  code: string;
  title: string;
}

export const DEFAULT_LANGUAGE = "en";
export const COMMON_MODULE = "common";

export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = [
  { code: "en", title: "English" },
  { code: "de", title: "Deutsch" },
];

export const resolveLanguage = (language?: string | null): string => {
  const code = language?.toLowerCase().split("-")[0];
  return SUPPORTED_LANGUAGES.some((item) => item.code === code)
    ? (code as string)
    : DEFAULT_LANGUAGE;
};
