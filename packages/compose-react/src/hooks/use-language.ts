import { useCallback, useEffect, useState } from "react";

/**
 * Storage adapter used by `useLanguage`.
 */
export interface LanguageStorage {
  /** Reads a string value by key. */
  get: (key: string) => string | null;
  /** Writes a string value by key. */
  set: (key: string, value: string) => void;
}

const localStorageAdapter: LanguageStorage = {
  get(key) {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  },
  set(key, value) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  },
};

/**
 * Configuration options for `useLanguage`.
 */
export type UseLanguageOptions = {
  /** Storage key used for persistence. Defaults to `"language"`. */
  storageKey?: string;
  /** Fallback language when storage is empty. Defaults to `"en"`. */
  defaultLanguage?: string;
  /** Custom storage adapter. */
  storage?: LanguageStorage;
  /** Optional side effect invoked on language change. */
  onLanguageChange?: (language: string) => void;
};

/**
 * Manages a persisted language value with pluggable storage.
 *
 * @param options Hook options including storage adapter and callbacks.
 * @returns Current language and mutation helpers.
 */
export const useLanguage = (options: UseLanguageOptions = {}) => {
  const {
    storageKey = "language",
    defaultLanguage = "en",
    storage = localStorageAdapter,
    onLanguageChange,
  } = options;

  const [language, setLanguageState] = useState<string>(() => {
    const storedValue = storage.get(storageKey);
    return storedValue || defaultLanguage;
  });

  useEffect(() => {
    storage.set(storageKey, language);
    onLanguageChange?.(language);
  }, [language, onLanguageChange, storage, storageKey]);

  const setLanguage = useCallback((nextLanguage: string) => {
    setLanguageState(nextLanguage);
  }, []);

  return {
    language,
    setLanguage,
    changeLanguage: setLanguage,
  };
};
