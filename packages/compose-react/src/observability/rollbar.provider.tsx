import { ErrorBoundary, Provider } from "@rollbar/react";
import Rollbar from "rollbar";
import { useEffect, useMemo, type ComponentType, type ReactNode } from "react";
import { getQueryClient } from "@/providers/query-client";
import { attachQueryErrorReporting } from "./report-query-errors";
import {
  createRollbarConfig,
  type RollbarConfigOptions,
} from "./rollbar.config";

export interface RollbarFallbackProps {
  error: Error | null;
  resetError: () => void;
}

/**
 * Shown instead of a blank page when a render throws. Deliberately plain: it has to render when the
 * app's own state is already known-bad, so it depends on nothing but theme tokens.
 */
const DefaultFallback = ({ resetError }: RollbarFallbackProps) => (
  <div
    className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center"
    role="alert"
  >
    <div className="space-y-1">
      <p className="text-lg font-semibold text-foreground">
        Something went wrong
      </p>
      <p className="text-sm text-medium-emphasis">
        The error has been reported. Try again, or reload the page if it keeps
        happening.
      </p>
    </div>
    <button
      onClick={resetError}
      className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
    >
      Try again
    </button>
  </div>
);

export interface RollbarProviderProps extends RollbarConfigOptions {
  children: ReactNode;
  /** Replaces the built-in crash screen. */
  fallback?: ComponentType<RollbarFallbackProps>;
}

/**
 * Puts Rollbar in front of the whole tree.
 *
 * Mount this outermost -- above the query, theme and router providers -- so a throw during their
 * own setup is still caught and reported rather than blanking the page.
 *
 * Reporting is inert until a client token is seeded (see `createRollbarConfig`), but the boundary is
 * always live, so the crash screen behaves identically in local development and in production.
 *
 * Covers uncaught errors, unhandled rejections, render crashes, and bugs thrown inside query
 * functions. Request failures are not covered here: pass `createHttpFailureReporter` to your
 * `HttpClient` as `onError` for those.
 */
export const RollbarProvider = ({
  children,
  fallback = DefaultFallback,
  ...configOptions
}: RollbarProviderProps) => {
  // One instance for the life of the app. Reconstructing it on re-render would reinstall the
  // window handlers and lose Rollbar's own telemetry buffer.
  const rollbar = useMemo(
    () => new Rollbar(createRollbarConfig(configOptions)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(
    () => attachQueryErrorReporting(getQueryClient(), rollbar),
    [rollbar],
  );

  return (
    <Provider instance={rollbar}>
      <ErrorBoundary fallbackUI={fallback} level="critical">
        {children}
      </ErrorBoundary>
    </Provider>
  );
};
