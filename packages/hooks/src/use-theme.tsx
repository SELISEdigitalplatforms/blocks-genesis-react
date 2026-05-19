import {
  type Context,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createCookieStore } from "@blocks-kit/primitives";

/**
 * Supported persisted theme values.
 */
export type ThemeValue = "light" | "dark" | "system";

type WritableTheme = "light" | "dark";

type MinimalCookieStore = {
  get: (name: string) => string | null;
  set: (name: string, value: string) => void;
};

/**
 * Theme persistence adapter used by `ThemeProvider`.
 */
export type ThemeStorage = {
  /** Reads a persisted theme value by key. */
  get: (key: string) => ThemeValue | null;
  /** Persists a theme value by key. */
  set: (key: string, value: ThemeValue) => void;
};

/**
 * Creates a `ThemeStorage` adapter backed by browser cookies.
 *
 * @param cookieStore Optional cookie store implementation.
 * @returns Cookie-backed theme storage adapter.
 */
const createCookieThemeStorage = (cookieStore?: MinimalCookieStore): ThemeStorage => {
  const store = cookieStore ?? (createCookieStore() as MinimalCookieStore);

  return {
    get(key) {
      const value = store.get(key);
      if (value === "light" || value === "dark" || value === "system") {
        return value;
      }
      return null;
    },
    set(key, value) {
      store.set(key, value);
    },
  };
};

const getSystemTheme = (): WritableTheme => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const applyTheme = (resolvedTheme: WritableTheme) => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
};

/**
 * Theme context contract exposed by `useTheme`.
 */
export type ThemeContextValue = {
  /** Persisted theme preference. */
  theme: ThemeValue;
  /** Effective rendered theme after resolving `system`. */
  resolvedTheme: WritableTheme;
  /** Updates persisted theme preference. */
  setTheme: (nextTheme: ThemeValue) => void;
  /** Toggles between `light` and `dark`. */
  toggleTheme: () => void;
};

/**
 * Default theme context instance.
 */
export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Properties accepted by `ThemeProvider`.
 */
export type ThemeProviderProps = {
  /** Descendant React tree. */
  children: ReactNode;
  /** Persistence key for the theme value. Defaults to `"theme"`. */
  storageKey?: string;
  /** Default preference when no persisted value exists. Defaults to `"system"`. */
  defaultTheme?: ThemeValue;
  /** Custom storage adapter. */
  storage?: ThemeStorage;
  /** Optional cookie store for cookie-backed storage helper. */
  cookieStore?: MinimalCookieStore;
};

/**
 * Provides theme state, persistence, and DOM class synchronization.
 *
 * Behavior notes:
 * - Applies `dark` class on `document.documentElement`.
 * - Tracks system color-scheme changes when theme is `system`.
 * - Safe to import in SSR; DOM writes occur only in effects.
 *
 * @param props Theme provider props.
 * @returns Context provider element.
 */
export function ThemeProvider({
  children,
  storageKey = "theme",
  defaultTheme = "system",
  storage,
  cookieStore,
}: ThemeProviderProps) {
  const resolvedStorage = useMemo(
    () => storage ?? createCookieThemeStorage(cookieStore),
    [cookieStore, storage],
  );

  const [theme, setThemeState] = useState<ThemeValue>(() => {
    const storedTheme = resolvedStorage.get(storageKey);
    return storedTheme ?? defaultTheme;
  });

  const [systemTheme, setSystemTheme] = useState<WritableTheme>(getSystemTheme);

  const resolvedTheme = useMemo<WritableTheme>(
    () => (theme === "system" ? systemTheme : theme),
    [theme, systemTheme],
  );

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const setTheme = useCallback(
    (nextTheme: ThemeValue) => {
      resolvedStorage.set(storageKey, nextTheme);
      setThemeState(nextTheme);
      if (nextTheme === "system") {
        setSystemTheme(getSystemTheme());
      }
    },
    [resolvedStorage, storageKey],
  );

  const toggleTheme = useCallback(() => {
    const nextTheme: ThemeValue = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  }, [resolvedTheme, setTheme]);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Consumes theme context from `ThemeProvider`.
 *
 * @param themeContext Optional custom context instance.
 * @returns Theme context value.
 * @throws When called outside a matching provider.
 */
export const useTheme = (themeContext: Context<ThemeContextValue | undefined> = ThemeContext) => {
  const context = useContext(themeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};

export { createCookieThemeStorage };
