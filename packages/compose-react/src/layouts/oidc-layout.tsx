import type * as React from "react";
import { useMemo } from "react";

import { OidcContext, type OidcContextValue } from "./oidc-context";

export function OidcLayout({
  children,
  value,
}: {
  children?: React.ReactNode;
  value?: OidcContextValue;
}) {
  const contextValue = useMemo(() => value ?? { isLoading: false }, [value]);
  return (
    <OidcContext.Provider value={contextValue}>{children}</OidcContext.Provider>
  );
}
