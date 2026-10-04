import { useCallback } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { initiateService } from "@/services/initiate.service";
import { getRuntimeEnv } from "@/lib/runtime-env";
import type { BlocksApp } from "./app-switcher.types";

export type ResolvedApp = BlocksApp & {
  initiateUrl: string;
  isLoading: boolean;
  /**
   * Call the moment the link is used -- clicked, middle-clicked, opened from the context menu or
   * dragged out. The URL's `state` is single-use, so it is dropped and a fresh one fetched.
   */
  markUsed: () => void;
};

interface UseAppRedirectUrlsParams {
  open: boolean;
  apps: BlocksApp[];
  /**
   * Compute the `forwardedTo` for a given app. Kept as a callback so callers
   * can apply their own precedence (per-app default → prop → path fallback).
   */
  resolveForwardedTo: (app: BlocksApp) => string;
}

/**
 * How long an initiate URL is handed out after it was fetched.
 *
 * IAM keeps the flow context behind each URL's `state` for 600 s (`IdpFlowCacheTtlSeconds`), and
 * that window has to cover the whole sign-in at the target app, password typing included. Handing
 * out a URL for at most half of it leaves every user at least five minutes to finish.
 */
export const INITIATE_URL_MAX_AGE_MS = 5 * 60 * 1000;

const initiateQueryKey = (
  clientId: string,
  redirectUri: string,
  forwardedTo: string,
) => ["idp-initiate", clientId, redirectUri, forwardedTo] as const;

/**
 * The IAM initiate redirect URL for every app in `apps`, fetched when the AppSwitcher popover
 * opens and reused across opens for up to `INITIATE_URL_MAX_AGE_MS`.
 *
 * Every open used to call `/idp/initiate` once per app -- eight requests, each minting a state IAM
 * then held for ten minutes -- even when the user only looked. The URLs are not tied to the user
 * (the call is anonymous), so reuse is safe within three limits:
 *
 * - Age. A URL older than `INITIATE_URL_MAX_AGE_MS` is never shown; the tile waits for a new one.
 * - Single use. `markUsed` drops a URL as soon as it is used, because the callback consumes its
 *   `state` -- a second use would fail with `invalid_state`.
 * - Scope. Cached per tab (in-memory TanStack cache, cleared on logout) and keyed by client,
 *   redirect URI and `forwardedTo`, so two tabs never share a state and a URL never lands the user
 *   on a page they did not ask for.
 *
 * Returns `[]` while closed.
 */
export function useAppRedirectUrls({
  open,
  apps,
  resolveForwardedTo,
}: UseAppRedirectUrlsParams): ResolvedApp[] {
  const queryClient = useQueryClient();

  const requests = apps.map((app) => {
    const clientId = getRuntimeEnv(app.clientId);
    const redirectUri = getRuntimeEnv(app.redirectUri);
    const forwardedTo = resolveForwardedTo(app);
    return {
      app,
      clientId,
      redirectUri,
      forwardedTo,
      queryKey: initiateQueryKey(clientId, redirectUri, forwardedTo),
    };
  });

  const results = useQueries({
    queries: requests.map(
      ({ clientId, redirectUri, forwardedTo, queryKey }) => ({
        queryKey,
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          initiateService.fetchRedirectUrl(
            { clientId, redirectUri, forwardedTo },
            signal,
          ),
        enabled: open,
        staleTime: INITIATE_URL_MAX_AGE_MS,
        gcTime: INITIATE_URL_MAX_AGE_MS,
        // Replace a URL as it ages out while the popover stays open, rather than leaving the tile on
        // "Loading…" until it is reopened.
        refetchInterval: INITIATE_URL_MAX_AGE_MS,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: false,
      }),
    ),
  });

  const markUsed = useCallback(
    (queryKey: readonly unknown[]) => {
      // Deferred past the event: React flushes a click's updates before the browser follows the
      // link, and the tile drops its href while loading -- resetting synchronously would cancel the
      // very navigation that used the URL.
      setTimeout(() => {
        void queryClient.resetQueries({ queryKey, exact: true });
      }, 0);
    },
    [queryClient],
  );

  if (!open || apps.length === 0) return [];

  const now = Date.now();
  return requests.map(({ app, queryKey }, index) => {
    const result = results[index];
    const url =
      result?.data && now - result.dataUpdatedAt < INITIATE_URL_MAX_AGE_MS
        ? result.data
        : undefined;
    return {
      ...app,
      initiateUrl: url ?? app.initiateUrl,
      isLoading: !url,
      markUsed: () => markUsed(queryKey),
    };
  });
}
