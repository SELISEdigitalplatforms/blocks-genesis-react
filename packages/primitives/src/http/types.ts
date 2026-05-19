/**
 * Supported HTTP methods for the client.
 */
export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

/**
 * Query parameter value accepted by URL builders.
 */
export type QueryParamValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean | null | undefined>;

/**
 * Query parameter map keyed by parameter name.
 */
export type QueryParams = Record<string, QueryParamValue>;

/**
 * Supported response parsing modes.
 */
export type ResponseType = "auto" | "json" | "text" | "blob" | "arrayBuffer" | "stream" | "none";

/**
 * Retry policy for failed HTTP calls.
 */
export interface RetryPolicy {
  /** Maximum retry count (excluding first attempt). */
  retries: number;
  /** Initial delay in milliseconds before retry. */
  delay: number;
  /** Exponential backoff multiplier. Defaults to `2`. */
  factor?: number;
  /** Applies random jitter to retry delays when `true`. */
  jitter?: boolean;
  /** Allowed HTTP methods for retry logic. */
  retryOnMethods?: HttpMethod[];
  /** Retryable status codes. */
  retryOnStatus?: number[];
}

/**
 * Request execution context metadata.
 */
export interface RequestContext {
  /** Fully resolved request URL. */
  url: string;
  /** Effective HTTP method. */
  method: HttpMethod;
  /** Zero-based retry attempt index. */
  attempt: number;
}

/**
 * Serializes request body values before sending to `fetch`.
 */
export type BodySerializer = (
  body: unknown,
  headers: Headers,
  request: RequestConfig,
) => BodyInit | null | undefined;

/**
 * Parses raw `fetch` responses into typed payloads.
 */
export type ResponseParser = <T = unknown>(
  response: Response,
  responseType: ResponseType,
) => Promise<T>;

/**
 * Client-level HTTP configuration.
 */
export interface HttpClientConfig {
  /** Base URL prefixed to relative request paths. */
  baseUrl?: string;
  /** Default timeout in milliseconds. */
  timeout?: number;
  /** Default headers merged into each request. */
  headers?: HeadersInit;
  /** Default credentials mode passed to `fetch`. */
  credentials?: RequestCredentials;
  /** Structured retry behavior. */
  retryPolicy?: Partial<RetryPolicy>;
  /** Legacy alias for retry count. Prefer `retryPolicy.retries`. */
  retries?: number;
  /** Legacy alias for retry delay. Prefer `retryPolicy.delay`. */
  retryDelay?: number;
  /** Legacy alias for retry factor. Prefer `retryPolicy.factor`. */
  retryFactor?: number;
  /** Legacy alias for jitter flag. Prefer `retryPolicy.jitter`. */
  retryJitter?: boolean;
  /** Default response parsing mode. */
  responseType?: ResponseType;
  /** Optional body serializer override. */
  serializeBody?: BodySerializer;
  /** Optional response parser override. */
  parseResponse?: ResponseParser;
  /** Optional custom fetch implementation. */
  fetchFn?: typeof fetch;
}

/**
 * Per-request configuration.
 */
export interface RequestConfig extends Omit<RequestInit, "method" | "body" | "headers" | "signal"> {
  /** Request method. Defaults to `GET`. */
  method?: HttpMethod;
  /** Query parameters appended to URL. */
  params?: QueryParams;
  /** Request payload before serialization. */
  body?: unknown;
  /** Request headers merged over client defaults. */
  headers?: HeadersInit;
  /** Request timeout in milliseconds. */
  timeout?: number;
  /** Optional abort signal. */
  signal?: AbortSignal;
  /** Treat URL as absolute and skip `baseUrl` join. */
  absoluteUrl?: boolean;
  /** Request-level response parsing mode. */
  responseType?: ResponseType;
  /** Request-level body serializer override. */
  serializeBody?: BodySerializer;
  /** Request-level response parser override. */
  parseResponse?: ResponseParser;
  /** Request-level retry policy override. */
  retryPolicy?: Partial<RetryPolicy>;
  /** Legacy alias for retry count. */
  retries?: number;
  /** Legacy alias for retry delay. */
  retryDelay?: number;
  /** Legacy alias for retry factor. */
  retryFactor?: number;
  /** Legacy alias for retry jitter. */
  retryJitter?: boolean;
}

/**
 * Typed HTTP response envelope.
 */
export interface HttpResponse<T = unknown> {
  /** Parsed response payload. */
  data: T;
  /** Numeric HTTP status code. */
  status: number;
  /** HTTP status text. */
  statusText: string;
  /** Response headers. */
  headers: Headers;
  /** `true` when response status is in the 2xx range. */
  ok: boolean;
  /** Raw `fetch` response object. */
  raw: Response;
}

type Awaitable<T> = T | Promise<T>;

/**
 * Request interceptor signature.
 */
export type RequestInterceptor = (
  config: RequestConfig & { url: string },
) => Awaitable<RequestConfig & { url: string }>;

/**
 * Response interceptor signature.
 */
export type ResponseInterceptor<T = unknown> = (
  response: HttpResponse<T>,
) => Awaitable<HttpResponse<T>>;
