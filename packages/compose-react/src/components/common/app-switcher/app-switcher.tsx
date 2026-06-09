import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/core/popover/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/core/dialog/dialog";
import { cn } from "@/lib/utils";
import { Grip, Pencil } from "lucide-react";
import utilityAppLight from "@/assets/images/apps/utilities-app-dark.svg";
import { APP_SWITCHER_DATA } from "./app-switcher-data";

export interface BlocksApp {
  key: string;
  label: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  clientId: string;
  redirectUri: string;
}

interface AppTileProps {
  app: BlocksApp;
  onClick: () => void;
  isLoading: boolean;
}
function AppTile({ app, onClick, isLoading }: AppTileProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="hover:bg-accent focus-visible:ring-ring group flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50"
    >
      <div className="flex h-12 w-12 items-center justify-center overflow-hidden">{app.icon}</div>
      <span className="text-foreground line-clamp-1 max-w-[90px] text-[12px] font-medium leading-tight">
        {isLoading ? "Opening…" : app.label}
      </span>
    </button>
  );
}
function LauncherTriggerIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
    >
      <rect x="1" y="1" width="5" height="5" rx="1.5" />
      <rect x="7.5" y="1" width="5" height="5" rx="1.5" />
      <rect x="14" y="1" width="5" height="5" rx="1.5" />
      <rect x="1" y="7.5" width="5" height="5" rx="1.5" />
      <rect x="7.5" y="7.5" width="5" height="5" rx="1.5" />
      <rect x="14" y="7.5" width="5" height="5" rx="1.5" />
      <rect x="1" y="14" width="5" height="5" rx="1.5" />
      <rect x="7.5" y="14" width="5" height="5" rx="1.5" />
      <rect x="14" y="14" width="5" height="5" rx="1.5" />
    </svg>
  );
}
function IdpIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-9 w-9">
      <rect width="40" height="40" rx="10" fill="#1A3C8F" />
      <path
        d="M20 7L10 11v9c0 5.55 4.27 10.74 10 12 5.73-1.26 10-6.45 10-12v-9L20 7z"
        fill="#ffffff"
        opacity="0.9"
      />
      <rect x="16" y="18" width="8" height="7" rx="1.5" fill="#1A3C8F" />
      <circle cx="20" cy="17.5" r="2.5" stroke="#1A3C8F" strokeWidth="1.5" fill="none" />
    </svg>
  );
}
function UilmIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-9 w-9">
      <rect width="40" height="40" rx="10" fill="#0E7490" />
      <path
        d="M8 12h16a2 2 0 012 2v8a2 2 0 01-2 2h-3l-3 3v-3H8a2 2 0 01-2-2v-8a2 2 0 012-2z"
        fill="white"
        opacity="0.95"
      />
      <path d="M12 17h8M12 20h5" stroke="#0E7490" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M24 21h6a1.5 1.5 0 011.5 1.5v5a1.5 1.5 0 01-1.5 1.5h-1.5l-2 2v-2H24a1.5 1.5 0 01-1.5-1.5v-5A1.5 1.5 0 0124 21z"
        fill="white"
        opacity="0.7"
      />
    </svg>
  );
}
function AiIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-9 w-9">
      <rect width="40" height="40" rx="10" fill="#7C3AED" />
      <path d="M20 8l2.5 6.5L29 17l-6.5 2.5L20 26l-2.5-6.5L11 17l6.5-2.5L20 8z" fill="white" />
      <path
        d="M29 26l1.2 3L33 30.2l-2.8 1.2L29 34l-1.2-2.8L25 30.2l2.8-1.2L29 26z"
        fill="white"
        opacity="0.6"
      />
      <path
        d="M12 26l1 2.5 2.5 1-2.5 1L12 33l-1-2.5-2.5-1 2.5-1L12 26z"
        fill="white"
        opacity="0.5"
      />
    </svg>
  );
}
function DataGatewayIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-9 w-9">
      <rect width="40" height="40" rx="10" fill="#D97706" />
      <ellipse cx="20" cy="13" rx="8" ry="3.5" fill="white" opacity="0.95" />
      <path
        d="M12 13v5c0 1.93 3.58 3.5 8 3.5s8-1.57 8-3.5v-5"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
        opacity="0.85"
      />
      <path
        d="M12 18v5c0 1.93 3.58 3.5 8 3.5s8-1.57 8-3.5v-5"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
        opacity="0.6"
      />
    </svg>
  );
}
function BlocksOsIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-9 w-9">
      <rect width="40" height="40" rx="10" fill="#059669" />
      <rect
        x="8"
        y="8"
        width="24"
        height="18"
        rx="2"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
      />
      <rect x="8" y="28" width="24" height="2" fill="white" opacity="0.8" />
      <circle cx="15" cy="14" r="1.5" fill="white" opacity="0.7" />
      <circle cx="20" cy="14" r="1.5" fill="white" opacity="0.7" />
      <circle cx="25" cy="14" r="1.5" fill="white" opacity="0.7" />
    </svg>
  );
}
function UtilityIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-9 w-9">
      <rect width="40" height="40" rx="10" fill="#64748B" />
      <path
        d="M27.5 9a5.5 5.5 0 00-5.24 7.18l-10.5 10.5a2 2 0 002.83 2.83l10.5-10.5A5.5 5.5 0 1027.5 9z"
        fill="white"
        opacity="0.9"
      />
      <circle cx="27.5" cy="14.5" r="2.5" fill="#64748B" />
    </svg>
  );
}
function LogicIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-9 w-9">
      <rect width="40" height="40" rx="10" fill="#4F46E5" />
      <rect x="8" y="17" width="6" height="6" rx="1.5" fill="white" opacity="0.9" />
      <rect x="26" y="11" width="6" height="6" rx="1.5" fill="white" opacity="0.9" />
      <rect x="26" y="23" width="6" height="6" rx="1.5" fill="white" opacity="0.9" />
      <path
        d="M14 20h5l3-6h2"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
      <path
        d="M19 20l3 6h2"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
    </svg>
  );
}
function ObservabilityIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-9 w-9">
      <rect width="40" height="40" rx="10" fill="#0891B2" />
      <path d="M20 12c-6 0-10 8-10 8s4 8 10 8 10-8 10-8-4-8-10-8z" fill="white" opacity="0.9" />
      <circle cx="20" cy="20" r="3.5" fill="#0891B2" />
      <circle cx="20" cy="20" r="1.5" fill="white" opacity="0.8" />
      <path
        d="M10 30l4-5M30 30l-4-5"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}
function DeploymentsIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-9 w-9">
      <rect width="40" height="40" rx="10" fill="#DC2626" />
      <path
        d="M20 7c-2 4-6 6-9 7l1 8c1 5 5 9 8 10 3-1 7-5 8-10l1-8c-3-1-7-3-9-7z"
        fill="white"
        opacity="0.9"
      />
      <path
        d="M20 14v8M16 18l4-4 4 4"
        stroke="#DC2626"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function StudioIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-9 w-9">
      <rect width="40" height="40" rx="10" fill="#DB2777" />
      <rect
        x="9"
        y="10"
        width="22"
        height="14"
        rx="2"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
        opacity="0.95"
      />
      <path d="M12 29h16" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
      <circle cx="20" cy="17" r="3" fill="white" opacity="0.9" />
    </svg>
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
      const blocksKey = window.process?.env.BLOCKS_X_BLOCKS_KEY;
      const iamBaseUrl = window.process?.env.userBaseUrl;
      const initiateUrl = `${iamBaseUrl}/api/idp/initiate?x-blocks-key=${blocksKey}&clientId=${app.clientId}&redirectUri=${app.redirectUri}&forwardedTo=${forwardedTo}`;
      const headers: Record<string, string> = {};
      if (blocksKey) headers["X-Blocks-Key"] = blocksKey;

      const response = await fetch(initiateUrl, { headers });
      const data = await response.json();

      if (data.redirect_uri) {
        window.location.href = data.redirect_uri as string;
      } else {
        // showErrorToast({ errors: "Failed to get authorization URL" });
        setLoadingKey(null);
      }
    } catch (error) {
      console.error("App login initiation error:", error);
      //   showErrorToast({ errors: "Unable to open app. Please try again." });
      setLoadingKey(null);
    }
  };

  const APP_SWITCHER_DATA: BlocksApp[] = [
    {
      key: "iam",
      label: "IAM",
      description: "Identity & Access",
      url: window.process?.env.BLOCKS_IAM_BASE_URL || "",
      icon: <IdpIcon />,
      clientId: window.process?.env.BLOCKS_IAM_CLIENT_ID || "",
      redirectUri: window.process?.env.BLOCKS_IAM_CALLBACK_URL || "",
    },
    {
      key: "localization",
      label: "Localization",
      description: "Localization",
      url: window.process?.env.BLOCKS_LOCALIZATION_BASE_URL || "",
      icon: <UilmIcon />,
      clientId: window.process?.env.BLOCKS_LOCALIZATION_CLIENT_ID || "",
      redirectUri: window.process?.env.BLOCKS_LOCALIZATION_CALLBACK_URL || "",
    },
    {
      key: "agents",
      label: "Agents",
      description: "AI Platform",
      url: window.process?.env.BLOCKS_AGENTS_BASE_URL || "",
      icon: <AiIcon />,
      clientId: window.process?.env.BLOCKS_AGENTS_CLIENT_ID || "",
      redirectUri: window.process?.env.BLOCKS_AGENTS_CALLBACK_URL || "",
    },
    {
      key: "data",
      label: "Data",
      description: "Data Integration",
      url: window.process?.env.BLOCKS_DATA_BASE_URL || "",
      icon: <DataGatewayIcon />,
      clientId: window.process?.env.BLOCKS_DATA_CLIENT_ID || "",
      redirectUri: window.process?.env.BLOCKS_DATA_CALLBACK_URL || "",
    },
    {
      key: "os",
      label: "OS",
      description: "Operating System",
      url: window.process?.env.BLOCKS_OS_BASE_URL || "",
      icon: <BlocksOsIcon />,
      clientId: window.process?.env.BLOCKS_OS_CLIENT_ID || "",
      redirectUri: window.process?.env.BLOCKS_OS_CALLBACK_URL || "",
    },
    {
      key: "utilities",
      label: "Utilities",
      description: "Utility Tools",
      url: window.process?.env.BLOCKS_UTILITIES_BASE_URL || "",
      icon: <UtilityIcon />,
      clientId: window.process?.env.BLOCKS_UTILITIES_CLIENT_ID || "",
      redirectUri: window.process?.env.BLOCKS_UTILITIES_CALLBACK_URL || "",
    },
    {
      key: "logic",
      label: "Logic",
      description: "Business Logic",
      url: window.process?.env.BLOCKS_LOGIC_BASE_URL || "",
      icon: <LogicIcon />,
      clientId: window.process?.env.BLOCKS_LOGIC_CLIENT_ID || "",
      redirectUri: window.process?.env.BLOCKS_LOGIC_CALLBACK_URL || "",
    },
    {
      key: "monitor",
      label: "Monitor",
      description: "Monitoring & Logs",
      url: window.process?.env.BLOCKS_MONITOR_BASE_URL || "",
      icon: <ObservabilityIcon />,
      clientId: window.process?.env.BLOCKS_MONITOR_CLIENT_ID || "",
      redirectUri: window.process?.env.BLOCKS_MONITOR_CALLBACK_URL || "",
    },
    {
      key: "release",
      label: "Release",
      description: "CI/CD & Releases",
      url: window.process?.env.BLOCKS_RELEASE_BASE_URL || "",
      icon: <DeploymentsIcon />,
      clientId: window.process?.env.BLOCKS_RELEASE_CLIENT_ID || "",
      redirectUri: window.process?.env.BLOCKS_RELEASE_CALLBACK_URL || "",
    },
  ];

  const blocksApps = [...APP_SWITCHER_DATA].sort((a, b) => a.label.localeCompare(b.label));
  const GripIcon = Grip as any;

  return (
    <>
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
    </>
  );
};
