export type Theme = "light" | "dark" | "system";

export function getSystemTheme(): Exclude<Theme, "system"> {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(resolvedTheme: Exclude<Theme, "system">) {
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
}
