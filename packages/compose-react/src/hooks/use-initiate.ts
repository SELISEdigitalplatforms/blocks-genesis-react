import {
  initiateService,
  type InitiateParams,
} from "@/services/initiate.service";
import { useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export function useInitiateRedirect({
  clientId,
  redirectUri,
  forwardedTo,
}: InitiateParams) {
  const query = useQuery({
    queryKey: ["initiate", "redirect", clientId, redirectUri, forwardedTo],
    queryFn: () =>
      initiateService.fetchRedirectUrl({ clientId, redirectUri, forwardedTo }),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
  });

  useEffect(() => {
    if (query.data) {
      window.location.replace(query.data);
    }
  }, [query.data]);

  const error =
    query.error instanceof Error
      ? query.error
      : query.error
        ? new Error("Failed to redirect")
        : null;

  return { isLoading: query.isLoading, error };
}

interface UsePrefetchRedirectOptions extends InitiateParams {
  enabled?: boolean;
}

export function usePrefetchRedirect({
  clientId,
  redirectUri,
  forwardedTo,
  enabled = true,
}: UsePrefetchRedirectOptions) {
  const query = useQuery({
    queryKey: ["initiate", "prefetch", clientId, redirectUri, forwardedTo],
    queryFn: () =>
      initiateService.fetchRedirectUrl({ clientId, redirectUri, forwardedTo }),
    enabled,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const redirect = useCallback(() => {
    if (query.data) window.location.replace(query.data);
  }, [query.data]);

  return {
    isFetching: query.isFetching,
    isReady: !query.isFetching && !!query.data,
    redirect,
  };
}
