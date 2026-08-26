import type Rollbar from "rollbar";
import type { HttpRequestFailure } from "@/lib/http/types";

/**
 * Builds an `onError` handler for `HttpClientConfig` that reports only transport failures.
 *
 * Failures that produced an HTTP response are skipped deliberately: a 4xx is a business outcome the
 * UI already surfaces, and a 5xx has already been reported by the server with a real stack trace,
 * so reporting it again from the browser only buries the better item. What is left -- the API
 * unreachable, DNS, CORS, TLS, offline -- the server cannot report by definition, because it never
 * received the request.
 *
 * `HttpClient` normalises every failure to an `HttpError` with status 500 before callers see it, so
 * this distinction only exists inside the `onError` hook. Reporting from a `catch` further out
 * cannot tell the two apart.
 */
export const createHttpFailureReporter =
  (rollbar: Rollbar) =>
  (failure: HttpRequestFailure): void => {
    if (!failure.transport) return;

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
