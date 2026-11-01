export type Dictionary = Readonly<Record<string, string>>;
export type TranslateValues = Readonly<Record<string, string | number>>;

export interface DictionarySource {
  language: string;
  dictionary?: Dictionary;
}

// The localization service writes this value for a key that has no text in a language.
export const MISSING_VALUE = "[ KEY MISSING ]";

const PLACEHOLDER = /\{\{\s*(\w+)\s*\}\}/g;
const pluralRulesCache = new Map<string, Intl.PluralRules>();

const getPluralRules = (language: string): Intl.PluralRules => {
  let rules = pluralRulesCache.get(language);
  if (!rules) {
    try {
      rules = new Intl.PluralRules(language);
    } catch {
      rules = new Intl.PluralRules("en");
    }
    pluralRulesCache.set(language, rules);
  }
  return rules;
};

export const interpolate = (
  template: string,
  values?: TranslateValues,
): string => {
  if (!values) return template;
  return template.replaceAll(PLACEHOLDER, (match, name: string) =>
    Object.hasOwn(values, name) ? String(values[name]) : match,
  );
};

const candidateKeys = (
  key: string,
  language: string,
  values?: TranslateValues,
): string[] => {
  const count = values?.count;
  if (typeof count !== "number") return [key];
  const category = getPluralRules(language).select(count);
  return [`${key}_${category}`, `${key}_other`, key];
};

const readValue = (dictionary: Dictionary | undefined, key: string) => {
  const value = dictionary?.[key];
  return value && value !== MISSING_VALUE ? value : undefined;
};

/**
 * Finds the text for a key in the first source that has it (chosen language
 * first, bundled English last) and fills `{{name}}` placeholders. A `count`
 * value picks the plural form (`KEY_one`, `KEY_other`). Returns the key itself
 * only when no source has it, which the key check reports as a bug.
 */
export const translate = (
  sources: readonly DictionarySource[],
  key: string,
  values?: TranslateValues,
): string => {
  for (const source of sources) {
    for (const candidate of candidateKeys(key, source.language, values)) {
      const value = readValue(source.dictionary, candidate);
      if (value !== undefined) return interpolate(value, values);
    }
  }
  return key;
};
