import { useT } from "@/i18n";
import { useBlocksAppConfigStore } from "@/hooks/use-blocks-app-config-store";
import { ThemeSwitcher } from "..";
import { Logo } from "../logo";
import { LanguageSelector } from "../language-selector";

export type LoginHeaderProps = {
  docsUrl?: string;
  blocksUrl?: string;
  githubUrl?: string;
};

export const LoginHeader = ({
  docsUrl = "https://docs.seliseblocks.com/",
  blocksUrl = "https://seliseblocks.com",
  githubUrl = "https://github.com/SELISEdigitalplatforms",
}: LoginHeaderProps) => {
  const { t } = useT("genesis.shared");
  const {
    config: { appLogoUrl },
  } = useBlocksAppConfigStore((state) => state);

  const resolveLogo = (variant: "light" | "dark") => {
    if (!appLogoUrl) return undefined;
    if (typeof appLogoUrl === "string") return appLogoUrl;
    return appLogoUrl[variant];
  };

  const appLightLogo = resolveLogo("light");
  const appDarkLogo = resolveLogo("dark");
  return (
    <nav className="site-nav">
      <Logo
        width={96}
        height={32}
        className="h-8 w-auto"
        lightSrc={appLightLogo}
        darkSrc={appDarkLogo}
      />

      <div className="nav-right">
        <div className="nav-links">
          <a
            href={docsUrl}
            target="_blank"
            rel="noreferrer"
            className="nav-link"
          >
            {t("LOGIN_HEADER.DOCS")}
          </a>
          {}
          <a
            href={blocksUrl}
            target="_blank"
            rel="noreferrer"
            className="nav-link"
          >
            Blocks
          </a>
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="nav-link"
          >
            GitHub
          </a>
          {}
        </div>
        <LanguageSelector className="nav-link" />
        <ThemeSwitcher
          className="nav-link inline-flex items-center gap-1.5"
          showChevron={false}
        />
      </div>
    </nav>
  );
};
