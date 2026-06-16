import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/core/popover/popover";
import { useTheme } from "@/hooks/use-theme";
import { type RuntimeKey } from "@/layouts/blocks-app-layout";
import { getRuntimeEnv } from "@/lib/runtime-env";
import { cn, getForwardedToPath } from "@/lib/utils";
import { Grip } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { APP_SWITCHER_DATA } from "./app-switcher.constant";
import type { ServiceName } from "@/store";
import type { ForwardToPaths } from "@/types";
import { useBlocksAppConfigStore } from "@/hooks/use-blocks-app-config-store";
import { initiateService } from "@/services/initiate.service";

export interface BlocksApp {
  key: ServiceName;
  label: string;
  description: string;
  url: string;
  icon: {
    darkModeIcon: React.ReactNode;
    lightModeIcon: React.ReactNode;
  };
  clientId: RuntimeKey;
  redirectUri: RuntimeKey;
  initiateUrl: string;
  isLoading: boolean;
}

interface AppTileProps {
  app: BlocksApp;
  isLoading: boolean;
}

const AppTile = ({ app, isLoading }: AppTileProps) => {
  const { resolvedTheme } = useTheme();
  const icon =
    resolvedTheme === "dark" ? app.icon.darkModeIcon : app.icon.lightModeIcon;

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
      <div className="flex h-12 w-12 items-center justify-center overflow-hidden">
        {typeof icon === "string" ? (
          <img
            src={icon}
            alt={app.label}
            className="h-full w-full object-contain"
          />
        ) : (
          icon
        )}
      </div>
      <span className="text-foreground line-clamp-1 max-w-[90px] text-[12px] font-medium leading-tight">
        {isLoading ? "Loading…" : app.label}
      </span>
    </a>
  );
};

type AppSwitcherProps = {
  forwardedTo?: ForwardToPaths;
};

export const AppSwitcher = ({ forwardedTo }: AppSwitcherProps) => {
  const resolvedForwardedTo = forwardedTo ?? getForwardedToPath();
  const [open, setOpen] = useState(false);
  const [redirectUrls, setRedirectUrls] = useState<Record<string, string>>({});
  const isRedirecting = useRef(false);
  const config = useBlocksAppConfigStore((state) => state.getConfig());

  const getRedirectUrl = useCallback(
    (app: BlocksApp) =>
      initiateService
        .fetchRedirectUrl({
          clientId: getRuntimeEnv(app.clientId),
          redirectUri: getRuntimeEnv(app.redirectUri),
          forwardedTo: resolvedForwardedTo,
        })
        .catch((err) => {
          console.error(
            `[AppSwitcher] Failed to get redirect URL for ${app.key}:`,
            err,
          );
          return null;
        }),
    [resolvedForwardedTo],
  );

  const filteredApps = useMemo(
    () => APP_SWITCHER_DATA.filter((app) => app.key !== config.name),
    [config.name],
  );

  useEffect(() => {
    if (isRedirecting.current || !open) return;
    setRedirectUrls({});

    isRedirecting.current = true;

    filteredApps.forEach((app, idx) => {
      getRedirectUrl(app)
        .then((redirectUrl) => {
          if (redirectUrl) {
            setRedirectUrls((prev) => ({ ...prev, [app.key]: redirectUrl }));
          }
        })
        .catch((error) => {
          console.error("Error getting redirect URL:", error);
        })
        .finally(() => {
          if (idx === filteredApps.length - 1) {
            isRedirecting.current = false;
          }
        });
    });
  }, [getRedirectUrl, open, filteredApps]);

  const blocksApps = useMemo(() => {
    return filteredApps
      .map((app) => ({
        ...app,
        initiateUrl: redirectUrls[app.key] ?? app.initiateUrl,
        isLoading: !redirectUrls[app.key],
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [redirectUrls, filteredApps]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="SELISE Blocks apps"
          className={cn(
            "text-muted-foreground flex h-9 w-9 items-center justify-center rounded-full transition-colors",
            "hover:bg-accent hover:text-foreground focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2",
            open && "bg-accent text-foreground",
          )}
        >
          <Grip className="stroke-3 h-6 w-6" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-60 overflow-hidden rounded-2xl p-0 shadow-xl"
      >
        {blocksApps.length > 0 && (
          <div className="bg-muted/50 border-t px-3 pb-4 pt-3">
            <p className="text-muted-foreground mb-2 px-1 text-[13px] font-semibold">
              SELISE Blocks
            </p>
            <div className="grid grid-cols-3">
              {blocksApps.map((app) => (
                <AppTile key={app.key} app={app} isLoading={app.isLoading} />
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
