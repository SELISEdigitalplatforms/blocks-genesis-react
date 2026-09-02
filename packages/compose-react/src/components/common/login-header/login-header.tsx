import { useBlocksAppConfigStore } from "@/hooks/use-blocks-app-config-store";
import { ThemeSwitcher } from "..";
import { Logo } from "../logo";

export type LoginHeaderProps = {
  docsUrl?: string;
  blocksUrl?: string;
  githubUrl?: string;
  /** IAM signup page URL. The pill is omitted entirely when this is absent. */
  signUpUrl?: string;
};

export const LoginHeader = ({
  docsUrl = "https://docs.seliseblocks.com/",
  blocksUrl = "https://seliseblocks.com",
  githubUrl = "https://github.com/SELISEdigitalplatforms",
  signUpUrl,
}: LoginHeaderProps) => {
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
        <a href={docsUrl} target="_blank" rel="noreferrer" className="nav-link">
          Docs
        </a>
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
        {signUpUrl && (
          <a href={signUpUrl} className="nav-cta">
            Sign up
          </a>
        )}
        <ThemeSwitcher />
      </div>
    </nav>
  );
};
