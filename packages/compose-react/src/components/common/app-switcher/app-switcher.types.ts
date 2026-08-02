import type { ServiceName } from "@/store";
import type { ForwardToPaths, RuntimeKey } from "@/types";

export interface BlocksApp {
  id: ServiceName;
  label: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  clientId: RuntimeKey;
  redirectUri: RuntimeKey;
  initiateUrl: string;
  isLoading: boolean;
  isDisabled: boolean | (() => boolean);
  forwardedTo?: ForwardToPaths;
}
