import { Popover, PopoverContent, PopoverTrigger } from "@/components/core/popover/popover";
import { cn } from "@/lib/utils";
import { Grip } from "lucide-react";
import { useState } from "react";
import { APP_SWITCHER_DATA } from "./app-switcher.constant";
import { useTheme } from "@/hooks/use-theme";
import { getRuntimeEnv } from "@/lib/runtime-env";

export interface BlocksApp {
  key: string;
  label: string;
  description: string;
  url: string;
  icon: {
    darkModeIcon: React.ReactNode;
    lightModeIcon: React.ReactNode;
  }
  clientId: string;
  redirectUri: string;
}

interface AppTileProps {
  app: BlocksApp;
  onClick: () => void;
  isLoading: boolean;
}
function AppTile({ app, onClick, isLoading }: AppTileProps) {
  const {resolvedTheme} = useTheme();
  const icon = resolvedTheme === 'dark' ? app.icon.darkModeIcon : app.icon.lightModeIcon;

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="hover:bg-accent focus-visible:ring-ring group flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50"
    >
      <div className="flex h-12 w-12 items-center justify-center overflow-hidden">
        {typeof icon === 'string' ? (
          <img src={icon} alt={app.label} className="h-full w-full object-contain" />
        ) : (
          icon
        )}
      </div>
      <span className="text-foreground line-clamp-1 max-w-[90px] text-[12px] font-medium leading-tight">
        {isLoading ? "Opening…" : app.label}
      </span>
    </button>
  );
}


type AppSwitcherProps = {
  forwardedTo: string;
};

export const AppSwitcher = ({ forwardedTo }: AppSwitcherProps) => {
  const [open, setOpen] = useState(false);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const initiateLogin = async (app: BlocksApp) => {
    if (loadingKey) return;
    try {
      setLoadingKey(app.key);
      const blocksKey = getRuntimeEnv("BLOCKS_X_BLOCKS_KEY");
      const iamBaseUrl = getRuntimeEnv("userBaseUrl");
      const initiateUrl = `${iamBaseUrl}/api/idp/initiate?x-blocks-key=${blocksKey}&clientId=${app.clientId}&redirectUri=${app.redirectUri}&forwardedTo=${forwardedTo}`;
      const headers: Record<string, string> = {};
      if (blocksKey) headers["X-Blocks-Key"] = blocksKey;

      const response = await fetch(initiateUrl, { headers });
      const data = await response.json();

      if (data.redirect_uri) {
        window.open(data.redirect_uri as string, "_self",);
      } else {
        setLoadingKey(null);
      }
    } catch (error) {
      console.error("App login initiation error:", error);
      setLoadingKey(null);
    }
  };


  const blocksApps = [...APP_SWITCHER_DATA].sort((a, b) => a.label.localeCompare(b.label));
  const GripIcon = Grip as any;

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
            <GripIcon className="stroke-3 h-6 w-6" />
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
                  <AppTile
                    key={app.key}
                    app={app}
                    onClick={() => initiateLogin(app)}
                    isLoading={loadingKey === app.key}
                  />
                ))}
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
  );
};
