import { useAppSettingsStore } from "@/store";
import { applyTheme } from "@/lib/theme";

export function useTheme() {
  const {
    settings: { theme },
    systemTheme,
    setSettings,
    setSystemTheme,
  } = useAppSettingsStore();

  const resolvedTheme: Exclude<import("@/lib/theme").Theme, "system"> =
    theme === "system" ? systemTheme : theme;

  const setTheme = (newTheme: import("@/lib/theme").Theme) => {
    // Resolve before applying so applyTheme always receives "light" | "dark"
    const resolved = newTheme === "system" ? systemTheme : newTheme;
    setSettings({ theme: newTheme });
    applyTheme(resolved);
    // If switching to system, sync systemTheme from app immediately
    if (newTheme === "system") {
      const current = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? ("dark" as const)
        : ("light" as const);
      setSystemTheme(current);
    }
  };

  return { theme, setTheme, resolvedTheme };
}

// Re-export so consumers importing Theme from here don't break
export type { Theme } from "@/lib/theme";
