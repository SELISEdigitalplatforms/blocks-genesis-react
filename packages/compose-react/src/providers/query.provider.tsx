import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type * as React from "react";

let browserQueryClient: QueryClient | undefined;

const makeQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  });
};

export const getQueryClient = () => {
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
};

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
