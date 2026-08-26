import type { QueryClient } from "@tanstack/react-query";
import type Rollbar from "rollbar";
import { HttpError } from "@/lib/http/error";

/**
 * Reports errors thrown inside query and mutation functions that are not request failures.
 *
 * Narrow on purpose. Every failure from `HttpClient` arrives as an `HttpError` and is skipped here:
 * transport failures are already handled by `createHttpFailureReporter`, and HTTP statuses are
 * either business outcomes or faults the server reported itself. What remains is a genuine bug in a
 * query function -- a bad mapping, a null dereference on a response -- which React Query catches
 * and stores as query state, so it never reaches `window.onerror` and would otherwise be invisible.
 *
 * Returns an unsubscribe function.
 */
export const attachQueryErrorReporting = (
  queryClient: QueryClient,
  rollbar: Rollbar,
): (() => void) => {
  const report = (error: unknown, context: Record<string, unknown>) => {
    if (error instanceof HttpError) return;
    // Belt and braces: an HttpError that crossed a module boundary may fail `instanceof`.
    if (typeof (error as { status?: unknown })?.status === "number") return;

    rollbar.error(error instanceof Error ? error : new Error(String(error)), {
      source: "react-query",
      ...context,
    });
  };

  const unsubscribeQueries = queryClient.getQueryCache().subscribe((event) => {
    if (event.type !== "updated" || event.action.type !== "error") return;

    report(event.action.error, {
      kind: "query",
      queryHash: event.query.queryHash,
    });
  });

  const unsubscribeMutations = queryClient
    .getMutationCache()
    .subscribe((event) => {
      if (event.type !== "updated" || event.action.type !== "error") return;

      report(event.action.error, {
        kind: "mutation",
        mutationKey: event.mutation.options.mutationKey,
      });
    });

  return () => {
    unsubscribeQueries();
    unsubscribeMutations();
  };
};
