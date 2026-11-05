import { ChevronDown } from "lucide-react";
import { useLanguageSwitcher } from "@/hooks/use-language-switcher";
import { useLanguagesStore } from "@/i18n/languages";
import { useDocumentLanguage, useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/core/dropdown-menu/dropdown-menu";

export type LanguageSelectorProps = {
  /** Replaces the default appearance so the trigger can match its surrounding nav. */
  className?: string;
};

/**
 * Switches the UI language among the languages of the project (from the localization
 * service). Hidden while the project offers only one language.
 */
export function LanguageSelector({ className }: LanguageSelectorProps = {}) {
  const { t } = useT("genesis.shared");
  const { changeLanguage } = useLanguageSwitcher();
  const language = useDocumentLanguage();
  const languages = useLanguagesStore((state) => state.languages);

  if (languages.length < 2) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("LANGUAGE_SELECTOR.CHANGE_LANGUAGE")}
          className={cn(
            "relative z-50 inline-flex h-9 shrink-0 items-center justify-center gap-1 px-2.5 uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className ??
              "rounded-full border border-transparent text-sm font-medium text-muted-foreground hover:border-input hover:bg-accent hover:text-accent-foreground hover:shadow-sm",
          )}
        >
          <span>{language}</span>
          <ChevronDown className="h-4 w-4" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={language} onValueChange={changeLanguage}>
          {languages.map((lang) => (
            <DropdownMenuRadioItem
              key={lang.code}
              value={lang.code}
              lang={lang.code}
              className={lang.code === language ? "font-semibold" : ""}
            >
              {lang.title}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
