import { CreateAppConfigStore, type AppConfigStoreState } from "@/store/app-config-store";
import { createContext, useContext, useEffect, useState } from "react";
import { useStore, type StoreApi } from "zustand";

export const BlocksAppLayoutContext = createContext<StoreApi<AppConfigStoreState> | undefined>(
  undefined,
);

type BlocksAppLayoutProps = {
  children: React.ReactNode;
  config: Partial<AppConfigStoreState["config"]>;
};

const PLACEHOLDER_PREFIX = "__BLOCKS_";

type RuntimeKey =
  | "BLOCKS_OS_API_BASE_URL"
  | "BLOCKS_API_BASE_URL"
  | "BLOCKS_X_BLOCKS_KEY"
  | "BLOCKS_GOOGLE_SITE_KEY"
  | "BLOCKS_CONSTRUCT_URL"
  | "BLOCKS_GITHUB_SSO_CLIENT_ID"
  | "BLOCKS_AGENT_API_BASE_URL"
  | "BLOCKS_EUROLM_API_BASE_URL"
  | "BLOCKS_UTILITIES_API_BASE_URL"
  | "BLOCKS_IDP_BASE_URL"
  | "BLOCKS_UDS_API_BASE_URL"
  | "BLOCKS_OIDC_CLIENT_ID"
  | "projectBaseUrl"
  | "userBaseUrl";

declare global {
  interface Window {
    __BLOCKS_ENV__?: Partial<Record<RuntimeKey, string>>;
    process?: { env: Partial<Record<RuntimeKey, string>> };
  }
}

window.process = { env: window.__BLOCKS_ENV__ as Record<string, string> };

export const BlocksAppLayout = ({ children, config }: BlocksAppLayoutProps) => {
  const [store] = useState(() => CreateAppConfigStore(config));
  if (window && window.process && config) {
    const projectBaseUrlKey = (config.projectBaseUrlKey as RuntimeKey) ?? "BLOCKS_OS_API_BASE_URL";
    window.process.env.projectBaseUrl = window.process.env[projectBaseUrlKey] ?? "";

    const userBaseUrlKey = config.userBaseUrlKey as RuntimeKey;
    window.process.env["userBaseUrl"] = userBaseUrlKey
      ? window.process?.env[userBaseUrlKey] || ""
      : "";
  }
  return (
    <BlocksAppLayoutContext.Provider value={store}>{children}</BlocksAppLayoutContext.Provider>
  );
};

export const useBlocksAppConfigStore = <T,>(selector: (state: AppConfigStoreState) => T): T => {
  const context = useContext(BlocksAppLayoutContext);

  if (!context) {
    throw new Error("useBlocksAppConfigStore must be used within a BlocksAppLayout");
  }
  return useStore(context, selector);
};
