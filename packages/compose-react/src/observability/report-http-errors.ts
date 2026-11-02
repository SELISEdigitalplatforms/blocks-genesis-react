import type Rollbar from "rollbar";
import type { HttpRequestFailure } from "@/lib/http/types";
import { isNetworkFailure } from "./noise-filter";

/**
 * Builds an `onError` handler for `HttpClientConfig` that reports only transport failures that are
 * not browser network failures.
 *
 * Failures that produced an HTTP response are skipped deliberately: a 4xx is a business outcome the
 * UI already surfaces, and a 5xx has already been reported by the server with a real stack trace,
 * so reporting it again from the browser only buries the better item.
 *
 * Browser network failures are skipped too (`isNetworkFailure`: offline, DNS, CORS, TLS and aborted
 * requests all surface as `TypeError: Failed to fetch` and its Firefox/Safari equivalents, or as an
 * `AbortError`). They come from the user's connection rather than from Blocks, and an outage shows
 * up in server-side 5xx items and uptime monitoring instead. What is left -- a body that fails to
 * parse, a throw inside the client itself -- is a client fault the server cannot see.
 *
 * `HttpClient` normalises every failure to an `HttpError` with status 500 before callers see it, so
 * this distinction only exists inside the `onError` hook. Reporting from a `catch` further out
 * cannot tell the two apart.
 */
export const createHttpFailureReporter =
  (rollbar: Rollbar) =>
  (failure: HttpRequestFailure): void => {
    if (!failure.transport) return;
    if (isNetworkFailure(failure.error)) return;

    const error =
      failure.error instanceof Error
        ? failure.error
        : new Error(String(failure.error));

    rollbar.error(error, {
      source: "http-client",
      url: failure.url,
      method: failure.method,
    });
  };
