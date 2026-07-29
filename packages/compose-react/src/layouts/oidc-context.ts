import { createContext, useContext } from "react";

export interface OidcContextValue {
  isLoading: boolean;
  tenantId?: string;
  userName?: string;
  clientId?: string;
  redirectUri?: string;
  scope?: string;
  state?: string;
  nonce?: string;
  logoUrl?: string;
  themeColor?: string;
}

export const OidcContext = createContext<OidcContextValue>({
  isLoading: false,
});

export const useOidcContext = () => useContext(OidcContext);
