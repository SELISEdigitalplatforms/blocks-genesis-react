import { useCallback } from "react";
import {
  useQueries,
  useQueryClient,
  type QueryState,
} from "@tanstack/react-query";
import { InitiateError, initiateService } from "@/services/initiate.service";
import { getRuntimeEnv } from "@/lib/runtime-env";
import type { BlocksApp } from "./app-switcher.types";

export type ResolvedApp = BlocksApp & {
  initiateUrl: string;
  /** No usable URL yet and a request is (about to be) in flight: the tile shows "Loading…". */
  isLoading: boolean;
  /** The last request failed and none is in flight: the tile stays dimmed, without a link. */
  isUnavailable: boolean;
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
 * Whether IAM refused this key with a 4xx less than `INITIATE_URL_MAX_AGE_MS` ago.
 *
 * A 4xx is a client configuration IAM rejects (unknown client, unregistered redirect URI), which
 * will not change within a session, so asking again on every open only repeats the rejection.
 * 5xx and network failures may be transient and are retried on the next open.
 */
const isRecentlyRejected = (
  state: QueryState<string, Error> | undefined,
  now: number,
) =>
  state?.status === "error" &&
  state.error instanceof InitiateError &&
  state.error.status >= 400 &&
  state.error.status < 500 &&
  now - state.errorUpdatedAt < INITIATE_URL_MAX_AGE_MS;

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
 * - Rejection. After IAM answers a key with a 4xx, the tile shows the app as unavailable and the key
 *   is not asked again for `INITIATE_URL_MAX_AGE_MS`.
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
  const now = Date.now();

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
        // Read at render time rather than through an `enabled` callback, which older
        // @tanstack/react-query 5.x peers do not support. Each open re-renders, so a rejection that
        // has aged out re-enables the query and the reopen fetches it.
        enabled:
          open &&
          !isRecentlyRejected(
            queryClient.getQueryState<string, Error>(queryKey),
            now,
          ),
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

  return requests.map(({ app, queryKey }, index) => {
    const result = results[index];
    const url =
      result?.data && now - result.dataUpdatedAt < INITIATE_URL_MAX_AGE_MS
        ? result.data
        : undefined;
    // A request in flight (or paused offline) wins over an earlier failure: a retry on reopen shows "Loading…" until it
    // settles. A cancelled request (popover closed mid-flight) reverts to its pre-fetch state, and a
    // `markUsed` reset clears the query, so neither leaves the tile unavailable.
    const isUnavailable =
      !url && result?.status === "error" && result.fetchStatus === "idle";
    return {
      ...app,
      initiateUrl: url ?? app.initiateUrl,
      isLoading: !url && !isUnavailable,
      isUnavailable,
      markUsed: () => markUsed(queryKey),
    };
  });
}
