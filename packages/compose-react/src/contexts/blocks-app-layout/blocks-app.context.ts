import type { AppConfigStoreState } from "@/store";
import { createContext } from "react";
import type { StoreApi } from "zustand";

export const BlocksAppLayoutContext = createContext<
  StoreApi<AppConfigStoreState> | undefined
>(undefined);
