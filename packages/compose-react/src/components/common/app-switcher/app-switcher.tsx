import { Popover, PopoverContent } from "@/components/core/popover/popover";
import { useBlocksAppConfigStore } from "@/hooks/use-blocks-app-config-store";
import type { ForwardToPaths } from "@/types";
import { getForwardedToPath } from "@/utils";
import { useCallback, useMemo, useState } from "react";
import { AppSwitcherContent } from "./app-switcher-content";
import { AppSwitcherTrigger } from "./app-switcher-trigger";
import { filteredAppSwitcherData } from "./app-switcher.constant";
import type { BlocksApp } from "./app-switcher.types";
import { useAppRedirectUrls } from "./use-app-redirect-urls";

type AppSwitcherProps = {
  forwardedTo?: ForwardToPaths;
};

export const AppSwitcher = ({ forwardedTo }: AppSwitcherProps) => {
  const [open, setOpen] = useState(false);
  const config = useBlocksAppConfigStore((state) => state.getConfig());

  const filteredApps = useMemo(
    () => filteredAppSwitcherData.filter((app) => app.id !== config.name),
    [config.name],
  );

  const resolveForwardedTo = useCallback(
    (app: BlocksApp): ForwardToPaths =>
      app.forwardedTo ?? forwardedTo ?? getForwardedToPath(),
    [forwardedTo],
  );

  const blocksApps = useAppRedirectUrls({
    open,
    apps: filteredApps,
    resolveForwardedTo,
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <AppSwitcherTrigger open={open} />
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-60 overflow-hidden rounded-2xl p-0 shadow-xl"
      >
        <AppSwitcherContent apps={blocksApps} />
      </PopoverContent>
    </Popover>
  );
};
