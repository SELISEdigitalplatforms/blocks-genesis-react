import { type Theme } from "@/lib/theme";
import { useAppSettingsStore } from "@/store";

export function useTheme() {
  const {
    settings: { theme },
    systemTheme,
    setSettings,
    setSystemTheme,
  } = useAppSettingsStore();

  const resolvedTheme: Exclude<Theme, "system"> =
    theme === "system" ? systemTheme : theme;

  const setTheme = (newTheme: Theme) => {
    setSettings({ theme: newTheme });
    // applyTheme(resolved) ← remove this; ThemeProvider's useEffect handles it
    if (newTheme === "system") {
      const current = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      setSystemTheme(current);
    }
  };

  return { theme, setTheme, resolvedTheme };
}

// Re-export so consumers importing Theme from here don't break
export type { Theme } from "@/lib/theme";
