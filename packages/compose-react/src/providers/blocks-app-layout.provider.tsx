import { Toaster } from "@/components/core";
import { BlocksAppLayoutContext } from "@/contexts";
import {
  CreateAppConfigStore,
  type AppConfigStoreState,
} from "@/store/app-config.store";
import type { RuntimeKey } from "@/types";
import { useState } from "react";

type BlocksAppLayoutProps = {
  children: React.ReactNode;
  config: Partial<AppConfigStoreState["config"]>;
};

declare global {
  interface Window {
    __BLOCKS_ENV__?: Partial<Record<RuntimeKey, string>>;
    process?: { env: Partial<Record<RuntimeKey, string>> };
  }
}

// window is typed Window & typeof globalThis, and @types/node contributes a
// global `process` whose type this browser shim cannot satisfy. Assign through
// a plain Window reference so only the declaration above applies.
const browserWindow: Window = window;
browserWindow.process = {
  env: window.__BLOCKS_ENV__ as Partial<Record<RuntimeKey, string>>,
};

export const BlocksAppLayout = ({ children, config }: BlocksAppLayoutProps) => {
  const [store] = useState(() => CreateAppConfigStore(config));
  if (window && window.process && config) {
    const projectBaseUrlKey =
      config.name === "blocks-os"
        ? "BLOCKS_OS_BASE_URL"
        : "BLOCKS_LOGIC_BASE_URL";
    window.process.env.projectBaseUrl =
      window.process.env[projectBaseUrlKey] ?? "";

    const userBaseUrlKey = "BLOCKS_IAM_BASE_URL";
    window.process.env["userBaseUrl"] = userBaseUrlKey
      ? window.process?.env[userBaseUrlKey] || ""
      : "";

    const notificationBaseUrlKey = "BLOCKS_LOGIC_BASE_URL";
    window.process.env["notificationBaseUrl"] = notificationBaseUrlKey
      ? window.process?.env[notificationBaseUrlKey] || ""
      : "";
  }
  return (
    <BlocksAppLayoutContext.Provider value={store}>
      {children}
      <Toaster />
    </BlocksAppLayoutContext.Provider>
  );
};
