import { ChevronDown, Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/core/dropdown-menu/dropdown-menu";
import { useTheme } from "@/hooks/use-theme";

type ThemeOption = "light" | "dark" | "system";

const OPTIONS = {
  system: { Icon: Monitor, label: "Auto" },
  light: { Icon: Sun, label: "Light" },
  dark: { Icon: Moon, label: "Dark" },
} satisfies Record<
  ThemeOption,
  {
    Icon: LucideIcon;
    label: string;
  }
>;

const OPTION_ORDER: ThemeOption[] = ["system", "light", "dark"];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const ThemeIcon = OPTIONS[theme].Icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Change theme"
          className="relative z-50 inline-flex h-9 items-center justify-center gap-1 rounded-full border border-transparent px-2.5 text-muted-foreground transition-all hover:border-input hover:bg-accent hover:text-accent-foreground hover:shadow-sm"
        >
          <ThemeIcon className="h-4 w-4" aria-hidden />
          <ChevronDown className="h-4 w-4" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => setTheme(value as ThemeOption)}
        >
          {OPTION_ORDER.map((value) => {
            const { Icon, label } = OPTIONS[value];

            return (
              <DropdownMenuRadioItem key={value} value={value}>
                <Icon aria-hidden />
                {label}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
