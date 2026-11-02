import { Fragment } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguageSwitcher } from "@/hooks/use-language-switcher";
import { useLanguagesStore } from "@/i18n/languages";
import { useDocumentLanguage } from "@/i18n/use-t";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components";

/**
 * Switches the UI language among the languages of the project (from the localization
 * service). Hidden while the project offers only one language.
 */
export function LanguageSelector() {
  const { changeLanguage } = useLanguageSwitcher();
  const language = useDocumentLanguage();
  const languages = useLanguagesStore((state) => state.languages);

  if (languages.length < 2) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative z-50 inline-flex h-9 items-center justify-center gap-1 rounded-full border border-transparent px-2.5 text-sm font-medium uppercase text-muted-foreground transition-all hover:border-input hover:bg-accent hover:text-accent-foreground hover:shadow-sm"
        >
          <span>{language}</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang, index) => (
          <Fragment key={lang.code}>
            <DropdownMenuItem
              lang={lang.code}
              className={lang.code === language ? "font-semibold" : ""}
              onClick={() => changeLanguage(lang.code)}
            >
              {lang.title}
            </DropdownMenuItem>
            {index !== languages.length - 1 && <DropdownMenuSeparator />}
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
