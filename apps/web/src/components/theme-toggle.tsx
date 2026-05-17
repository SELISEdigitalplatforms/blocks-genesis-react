import * as React from "react";
import { Moon, Sun } from "lucide-react";

import { createStorage } from "@blocks-kit/primitives";
import { Button } from "@blocks-kit/ui/components/button";
import { cn } from "@blocks-kit/ui/lib/utils";

type Theme = "light" | "dark";

const storage = createStorage("local", { prefix: "blocks" });

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  if (document.documentElement.classList.contains("dark")) return "dark";
  const stored = storage.get<Theme>("theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = React.useState<Theme>(getInitialTheme);

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    storage.set("theme", theme);
  }, [theme]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
      className={cn("gap-2", className)}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      {theme === "light" ? "Dark" : "Light"}
    </Button>
  );
}
