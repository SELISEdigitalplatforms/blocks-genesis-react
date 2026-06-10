import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/core/popover/popover";
import { useTheme } from "@/hooks/use-theme";
import { useBlocksAppConfigStore, type RuntimeKey } from "@/layouts/blocksapp-layout";
import { getRuntimeEnv } from "@/lib/runtime-env";
import { cn } from "@/lib/utils";
import { Grip as LucideGrip } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { APP_SWITCHER_DATA } from "./app-switcher.constant";

const Link = RouterLink as any;
const Grip = LucideGrip as any;

export interface BlocksApp {
  key: string;
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
    <Link
      to={app.initiateUrl}
      className="hover:bg-accent focus-visible:ring-ring group flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50"
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
        {isLoading ? "Opening…" : app.label}
      </span>
    </Link>
  );
};

type AppSwitcherProps = {
  forwardedTo: string;
};

export const AppSwitcher = ({ forwardedTo }: AppSwitcherProps) => {
  const [open, setOpen] = useState(false);
  const [redirectUrls, setRedirectUrls] = useState<Record<string, string>>({});
  const isRedirecting = useRef(false);
  const config = useBlocksAppConfigStore((state) => state.getConfig());

  const getRedirectUrl = useCallback(
    async (app: BlocksApp) => {
      try {
        const blocksKey = getRuntimeEnv("BLOCKS_X_BLOCKS_KEY");
        const iamBaseUrl = getRuntimeEnv("userBaseUrl");
        const clientId = getRuntimeEnv(app.clientId);
        const redirectUri = getRuntimeEnv(app.redirectUri);

        const initiateUrl = `${iamBaseUrl}/api/idp/initiate?x-blocks-key=${blocksKey}&clientId=${clientId}&redirectUri=${redirectUri}&forwardedTo=${forwardedTo}`;
        const headers: Record<string, string> = {};
        if (blocksKey) headers["X-Blocks-Key"] = blocksKey;

        const response = await fetch(initiateUrl, { headers });
        const data = await response.json();
        if (data.redirect_uri) {
          return data.redirect_uri as string;
        }
      } catch (error) {
        console.error(`[AppSwitcher] Failed to get redirect URL for ${app.key}:`, error);
      }

      return null;
    },
    [forwardedTo],
  );

  const filteredApps = APP_SWITCHER_DATA.filter((app) => app.key !== config.name);

  useEffect(() => {
    if (isRedirecting.current || !open) return;
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
  }, [getRedirectUrl, open]);

  const blocksApps = useMemo(() => {
    return filteredApps.map((app) => ({
      ...app,
      initiateUrl: redirectUrls[app.key] ?? app.initiateUrl,
    })).sort((a, b) => a.label.localeCompare(b.label));
  }, [redirectUrls]);

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
