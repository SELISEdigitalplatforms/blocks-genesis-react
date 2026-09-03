import { ChevronDown, Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/core/dropdown-menu/dropdown-menu";
import { cn } from "@/lib/utils";
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

/** Layout, positioning and focus behavior — kept regardless of `className`. */
const TRIGGER_BASE_CLASSES =
  "relative z-50 inline-flex h-9 items-center justify-center gap-2 px-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
/** Default typography, dropped entirely when the caller supplies its own `className`. */
const TRIGGER_DEFAULT_TYPOGRAPHY_CLASSES =
  "text-sm font-medium text-muted-foreground hover:text-foreground";

export type ThemeSwitcherProps = {
  /**
   * Replaces the default typography (font size/weight/color) so the trigger can match a
   * surrounding nav's own styling. Layout, positioning and the focus ring are unaffected.
   */
  className?: string;
  /** Set to false where the surrounding nav already reads as a menu (e.g. a bespoke navbar). */
  showChevron?: boolean;
};

export function ThemeSwitcher({
  className,
  showChevron = true,
}: ThemeSwitcherProps = {}) {
  const { theme, setTheme } = useTheme();
  const { Icon: ThemeIcon, label: themeLabel } = OPTIONS[theme];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Change theme"
          className={cn(
            TRIGGER_BASE_CLASSES,
            className ?? TRIGGER_DEFAULT_TYPOGRAPHY_CLASSES,
          )}
        >
          <ThemeIcon className="h-4 w-4" aria-hidden />
          <span>{themeLabel}</span>
          {showChevron && (
            <ChevronDown
              className="h-3.5 w-3.5 text-muted-foreground"
              aria-hidden
            />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Appearance
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => setTheme(value as ThemeOption)}
        >
          {OPTION_ORDER.map((value) => {
            const { Icon, label } = OPTIONS[value];
            const isActive = value === theme;

            return (
              <DropdownMenuRadioItem
                key={value}
                value={value}
                className={cn(
                  "gap-2 border border-transparent py-2 hover:border-input",
                  isActive && "text-primary",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                  aria-hidden
                />
                <span className={cn(isActive && "text-foreground font-medium")}>
                  {label}
                </span>
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
