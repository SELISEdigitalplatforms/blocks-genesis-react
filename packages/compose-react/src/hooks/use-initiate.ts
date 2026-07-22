import {
  initiateService,
  type InitiateParams,
} from "@/services/initiate.service";
import { useCallback, useEffect, useRef, useState } from "react";

export function useInitiateRedirect({
  clientId,
  redirectUri,
  forwardedTo,
}: InitiateParams) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const hasInitiated = useRef(false);

  useEffect(() => {
    if (hasInitiated.current) return;
    hasInitiated.current = true;

    initiateService
      .fetchRedirectUrl({ clientId, redirectUri, forwardedTo })
      .then((url) => window.location.replace(url))
      .catch((err) => {
        const wrapped =
          err instanceof Error ? err : new Error("Failed to redirect");
        setError(wrapped);
        console.error("[useInitiateRedirect]", wrapped);
      })
      .finally(() => setIsLoading(false));
  }, [clientId, redirectUri, forwardedTo]);

  return { isLoading, error };
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
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!enabled || hasFetched.current) return;
    hasFetched.current = true;

    setIsFetching(true);
    initiateService
      .fetchRedirectUrl({ clientId, redirectUri, forwardedTo })
      .then(setRedirectUrl)
      .catch((err) => console.error("[usePrefetchRedirect]", err))
      .finally(() => setIsFetching(false));
  }, [enabled, clientId, redirectUri, forwardedTo]);

  const redirect = useCallback(() => {
    if (redirectUrl) window.location.replace(redirectUrl);
  }, [redirectUrl]);

  return {
    isFetching,
    isReady: !isFetching && !!redirectUrl,
    redirect,
  };
}
