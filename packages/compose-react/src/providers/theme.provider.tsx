import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useAppSettingsStore } from "@/store";
import { applyTheme } from "@/lib/theme";
import type { Theme } from "@/lib/theme";

interface ThemeProviderProps {
  children: ReactNode;
  /**
   * Seeds the initial theme only when no persisted cookie exists yet.
   * If the user already has a saved preference, it always wins.
   */
  defaultTheme?: Theme;
  /**
   * Fires after every confirmed theme or resolved-theme change.
   * Does NOT fire on initial mount — only on actual changes.
   */
  onThemeChange?: (
    theme: Theme,
    resolvedTheme: Exclude<Theme, "system">,
  ) => void;
}

export function ThemeProvider({
  children,
  defaultTheme,
  onThemeChange,
}: ThemeProviderProps) {
  const {
    settings: { theme },
    systemTheme,
    setSettings,
    setSystemTheme,
  } = useAppSettingsStore();

  const resolvedTheme: Exclude<Theme, "system"> =
    theme === "system" ? systemTheme : theme;

  // Skip onThemeChange on initial mount — only fire on actual changes
  const isFirstRender = useRef(true);

  // ── Seed defaultTheme once on mount, only if no cookie persisted yet ────────
  useEffect(() => {
    if (!defaultTheme) return;
    // Cookie storage is synchronous, so if the cookie exists the store is
    // already rehydrated with the user's saved preference — don't override it
    const hasCookie = document.cookie.includes("app-settings-storage=");
    if (!hasCookie) {
      setSettings({ theme: defaultTheme });
    }
    // Intentionally empty dep array — seed is mount-only, one shot
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync resolved theme to DOM ───────────────────────────────────────────────
  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  // ── App media query listener — active only when theme is "system" ─────────────
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme, setSystemTheme]);

  // ── onThemeChange callback — skips initial mount ─────────────────────────────
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onThemeChange?.(theme, resolvedTheme);
  }, [theme, resolvedTheme, onThemeChange]);

  return <>{children}</>;
}
