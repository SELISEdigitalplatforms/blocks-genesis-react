import type * as React from "react";
import { createContext, useContext, useMemo } from "react";

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

const OidcContext = createContext<OidcContextValue>({ isLoading: false });

export const useOidcContext = () => useContext(OidcContext);

export function OidcLayout({
  children,
  value,
}: {
  children?: React.ReactNode;
  value?: OidcContextValue;
}) {
  const contextValue = useMemo(
    () => value ?? { isLoading: false },
    [value],
  );
  return (
    <OidcContext.Provider value={contextValue}>{children}</OidcContext.Provider>
  );
}
