import { cn } from "@/lib/utils";
import type { ResolvedApp } from "./use-app-redirect-urls";

interface AppSwitcherContentProps {
  apps: ResolvedApp[];
}

const AppIcon = ({ icon, label }: { icon: React.ReactNode; label: string }) => {
  return (
    <div className="flex h-12 w-12 items-center justify-center overflow-hidden">
      {typeof icon === "string" ? (
        <img src={icon} alt={label} className="h-full w-full object-contain" />
      ) : (
        icon
      )}
    </div>
  );
};

const AppTile = ({
  app,
  isLoading,
}: {
  app: ResolvedApp;
  isLoading: boolean;
}) => {
  return (
    <a
      href={isLoading ? undefined : app.initiateUrl}
      aria-disabled={isLoading}
      onClick={isLoading ? (e) => e.preventDefault() : undefined}
      className={cn(
        "hover:bg-accent focus-visible:ring-ring group flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2",
        isLoading && "pointer-events-none opacity-50 cursor-default",
      )}
    >
      <AppIcon icon={app.icon} label={app.label} />
      <span className="text-foreground line-clamp-1 max-w-[90px] text-[12px] font-medium leading-tight">
        {isLoading ? "Loading…" : app.label}
      </span>
    </a>
  );
};

/**
 * Body of the AppSwitcher popover — the section header plus the 3-column
 * grid of app tiles. Returns `null` when no apps are available so the
 * popover does not render an empty section.
 */
export function AppSwitcherContent({ apps }: AppSwitcherContentProps) {
  if (apps.length === 0) return null;

  return (
    <div className="bg-muted/50 border-t px-3 pb-4 pt-3">
      <p className="text-muted-foreground mb-2 px-1 text-[13px] font-semibold">
        SELISE Blocks
      </p>
      <div className="grid grid-cols-3">
        {apps.map((app) => (
          <AppTile key={app.id} app={app} isLoading={app.isLoading} />
        ))}
      </div>
    </div>
  );
}
