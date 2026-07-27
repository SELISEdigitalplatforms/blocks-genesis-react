import { QueryClientProvider } from "@tanstack/react-query";

import { getQueryClient } from "./query-client";
import type * as React from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
