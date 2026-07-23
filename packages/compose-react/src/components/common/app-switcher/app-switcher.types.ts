import type { ServiceName } from "@/store";
import type { RuntimeKey } from "@/types";

export interface BlocksApp {
  key: ServiceName;
  label: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  clientId: RuntimeKey;
  redirectUri: RuntimeKey;
  initiateUrl: string;
  isLoading: boolean;
  isDisabled: boolean | (() => boolean);
}
