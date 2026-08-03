import { useEffect, useMemo, useRef, useState } from "react";
import { initiateService } from "@/services/initiate.service";
import { getRuntimeEnv } from "@/lib/runtime-env";
import type { BlocksApp } from "./app-switcher.types";

export type ResolvedApp = BlocksApp & {
  initiateUrl: string;
  isLoading: boolean;
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
 * Pre-fetch the IAM initiate redirect URL for every app in `apps` whenever
 * the AppSwitcher popover opens. Replaces the inline `useEffect`/`useRef`
 * block that previously lived in `app-switcher.tsx`.
 *
 * - Returns `[]` while closed (no fetch, no state churn).
 * - Clears cached URLs on every open so a stale redirect never leaks across
 *   sessions.
 * - Aborts in-flight fetches on cleanup so React 18 Strict Mode's double
 *   invocation cannot surface a stale resolved URL.
 * - Uses a memoised `apps` snapshot so passing a fresh array reference on
 *   every render does not retrigger the effect in an infinite loop.
 */
export function useAppRedirectUrls({
  open,
  apps,
  resolveForwardedTo,
}: UseAppRedirectUrlsParams): ResolvedApp[] {
  const [redirectUrls, setRedirectUrls] = useState<Record<string, string>>({});

  // Snapshot the apps list so referential equality across renders is stable.
  const appsKey = apps.map((a) => a.id).join("|");
  const stableApps = useMemo(() => apps, [appsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the latest resolver in a ref so the effect only depends on `open`
  // and the app identity, not the caller's callback identity.
  const resolveRef = useRef(resolveForwardedTo);
  resolveRef.current = resolveForwardedTo;

  useEffect(() => {
    if (!open || stableApps.length === 0) return undefined;

    setRedirectUrls({});

    const controller = new AbortController();
    const { signal } = controller;

    stableApps.forEach((app) => {
      initiateService
        .fetchRedirectUrl({
          clientId: getRuntimeEnv(app.clientId),
          redirectUri: getRuntimeEnv(app.redirectUri),
          forwardedTo: resolveRef.current(app),
        })
        .then((redirectUrl) => {
          if (signal.aborted || !redirectUrl) return;
          setRedirectUrls((prev) => ({ ...prev, [app.id]: redirectUrl }));
        })
        .catch((err) => {
          if (signal.aborted) return;
          console.error(
            `[AppSwitcher] Failed to get redirect URL for ${app.id}:`,
            err,
          );
        });
    });

    return () => controller.abort();
  }, [open, stableApps]);

  if (!open || stableApps.length === 0) return [];

  return stableApps.map((app) => ({
    ...app,
    initiateUrl: redirectUrls[app.id] ?? app.initiateUrl,
    isLoading: !redirectUrls[app.id],
  }));
}
