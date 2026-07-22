import { BlocksAppLayoutContext } from "@/contexts";
import type { AppConfigStoreState } from "@/store";
import { useContext } from "react";
import { useStore } from "zustand";

export const useBlocksAppConfigStore = <T>(
  selector: (state: AppConfigStoreState) => T,
): T => {
  const context = useContext(BlocksAppLayoutContext);

  if (!context) {
    throw new Error(
      "useBlocksAppConfigStore must be used within a BlocksAppLayout",
    );
  }
  return useStore(context, selector);
};
