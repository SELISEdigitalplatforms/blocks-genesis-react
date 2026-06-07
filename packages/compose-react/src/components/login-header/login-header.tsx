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
  return (
    <nav className="site-nav">
      <Logo width={96} height={32} className="h-8 w-auto" />

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
