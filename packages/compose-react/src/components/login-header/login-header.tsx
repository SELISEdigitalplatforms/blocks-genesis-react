import { useBlocksAppConfigStore } from "@/index";
import { ThemeSwitcher } from "../common";
import { Logo } from "../common/logo";

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
  const {
    config: { appLogoUrl },
  } = useBlocksAppConfigStore((state) => state);

  const appLightLogo = appLogoUrl
    ? typeof appLogoUrl === "string"
      ? appLogoUrl
      : appLogoUrl.light
    : undefined;

  const appDarkLogo = appLogoUrl
    ? typeof appLogoUrl === "string"
      ? appLogoUrl
      : appLogoUrl.dark
    : undefined;
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
        <a href={blocksUrl} target="_blank" rel="noreferrer" className="nav-link">
          Blocks
        </a>
        <a href={githubUrl} target="_blank" rel="noreferrer" className="nav-link">
          GitHub
        </a>
        <ThemeSwitcher />
      </div>
    </nav>
  );
};
