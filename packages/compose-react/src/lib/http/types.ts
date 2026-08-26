import type { AuthTokenPair } from "@/models/auth.model";
import type { HttpError } from "./error";

export type HeadersInitValue =
  [string, string][] | Record<string, string> | Headers;
export type RequestBody =
  | string
  | object
  | Array<unknown>
  | FormData
  | URLSearchParams
  | Blob
  | File
  | null
  | undefined;

export interface HttpClientOptions {
  skipBlocksKey?: boolean;
  withCredentials?: boolean;
  absoluteUrl?: boolean;
  skipTokenRotation?: boolean;
  signal?: AbortSignal;
}

export interface RequestOptions extends HttpClientOptions {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: HeadersInitValue;
  body?: RequestBody;
}

type BaseRequestQueueItem<T> = {
  url: string;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
};

export type RequestQueueItem<T> = BaseRequestQueueItem<T> & {
  requestOption: RequestOptions;
};

/**
 * What a request failure looked like, reported before the error is normalised.
 *
 * `normalizeRequestError` turns everything -- including a `fetch` that never reached the server --
 * into an `HttpError` with status 500, so by the time a caller sees the error it can no longer tell
 * a real server fault from an unreachable API. `transport` preserves that distinction, which is the
 * difference between an error worth alerting on and one the server has already reported itself.
 */
export interface HttpRequestFailure {
  /** The error as thrown, before normalisation. */
  error: unknown;
  /** What the caller will actually receive. */
  normalized: HttpError;
  /** Absolute request URL. */
  url: string;
  method: RequestOptions["method"];
  /** True when the request never produced an HTTP response (DNS, CORS, TLS, offline, abort). */
  transport: boolean;
}

export interface HttpClientConfig {
  baseURL: string | (() => string);
  blocksKey: string | (() => string);
  onTokenRefresh?: () => Promise<AuthTokenPair>;
  onUnauthorized?: (error: unknown) => void;
  /** Paths that should never trigger an auth-failure redirect. Defaults to ["/login", "/signup"]. */
  excludedPaths?: string[];
  /** Where to send the user on an unrecoverable auth failure. Defaults to "/login". */
  loginRedirectPath?: string;
  /** Set false to fully delegate auth-failure handling to onUnauthorized instead of auto-redirecting. Defaults to true. */
  autoRedirectOnAuthFailure?: boolean;
  /**
   * Called for every failed request. Observational only -- the error is thrown to the caller either
   * way, and anything this throws is swallowed, so a reporting failure can never break a request.
   */
  onError?: (failure: HttpRequestFailure) => void;
}
