import { QueryClient } from "@tanstack/react-query";

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
