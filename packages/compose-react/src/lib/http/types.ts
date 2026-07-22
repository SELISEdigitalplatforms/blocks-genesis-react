import type { AuthTokenPair } from "@/models/auth.model";

export type HeadersInitValue =
  | [string, string][]
  | Record<string, string>
  | Headers;
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
}
