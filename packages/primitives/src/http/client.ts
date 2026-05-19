import type {
  BodySerializer,
  HttpClientConfig,
  HttpMethod,
  HttpResponse,
  RequestConfig,
  RequestInterceptor,
  ResponseInterceptor,
  ResponseType,
  RetryPolicy,
} from "./types";
import { HttpError } from "./error";
import { sleep } from "../utils/functions";
import { anySignal, appendQueryParams, joinUrl } from "./util";

const DEFAULT_TIMEOUT = 10_000;
const DEFAULT_RESPONSE_TYPE: ResponseType = "auto";

const DEFAULT_RETRY_POLICY: RetryPolicy = {
  retries: 0,
  delay: 300,
  factor: 2,
  jitter: true,
  retryOnMethods: ["GET", "HEAD", "OPTIONS"],
  retryOnStatus: [429, 500, 502, 503, 504],
};

const BODYLESS_METHODS = new Set<HttpMethod>(["GET", "HEAD"]);

const mergeHeaders = (...headersList: Array<HeadersInit | undefined>): Headers => {
  const headers = new Headers();

  for (const headerGroup of headersList) {
    if (!headerGroup) continue;

    if (headerGroup instanceof Headers) {
      headerGroup.forEach((value, key) => headers.set(key, value));
      continue;
    }

    if (Array.isArray(headerGroup)) {
      headerGroup.forEach(([key, value]) => headers.set(key, value));
      continue;
    }

    Object.entries(headerGroup).forEach(([key, value]) => {
      if (value !== undefined) {
        headers.set(key, value);
      }
    });
  }

  return headers;
};

const defaultBodySerializer: BodySerializer = (body, headers) => {
  if (body === null || body === undefined) return undefined;

  if (
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    body instanceof ReadableStream ||
    typeof body === "string"
  ) {
    return body;
  }

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return JSON.stringify(body);
};

const defaultResponseParser = async <T>(response: Response, responseType: ResponseType): Promise<T> => {
  if (responseType === "none") {
    return null as T;
  }

  if (responseType === "stream") {
    return response.body as T;
  }

  if (responseType === "json") {
    return (await response.json()) as T;
  }

  if (responseType === "text") {
    return (await response.text()) as T;
  }

  if (responseType === "blob") {
    return (await response.blob()) as T;
  }

  if (responseType === "arrayBuffer") {
    return (await response.arrayBuffer()) as T;
  }

  if (response.status === 204 || response.status === 205) {
    return null as T;
  }

  const contentType = response.headers.get("content-type")?.toLowerCase() || "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  if (
    contentType.includes("application/octet-stream") ||
    contentType.includes("application/pdf") ||
    contentType.includes("image/") ||
    contentType.includes("audio/") ||
    contentType.includes("video/")
  ) {
    return (await response.blob()) as T;
  }

  return (await response.text()) as T;
};

const parseErrorBody = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get("content-type")?.toLowerCase() || "";

  try {
    if (contentType.includes("application/json")) {
      return await response.json();
    }

    if (contentType.includes("text/")) {
      return await response.text();
    }

    return await response.text();
  } catch {
    return undefined;
  }
};

type InternalConfig = {
  baseUrl: string;
  timeout: number;
  headers: HeadersInit;
  retryPolicy: RetryPolicy;
  responseType: ResponseType;
  serializeBody: BodySerializer;
  parseResponse: typeof defaultResponseParser;
  credentials?: RequestCredentials;
  fetchFn?: typeof fetch;
};

/**
 * Fetch-based HTTP client with interceptor, retry, timeout, and parser support.
 *
 * Use this class for framework-agnostic HTTP communication where transport behavior
 * should stay generic and app/session behavior should live outside the client.
 */
export class HttpClient {
  private config: InternalConfig;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  /**
   * Creates a new HTTP client instance.
   *
   * @param config Client-level defaults for base URL, retry, headers, and parsing.
   */
  constructor(config: HttpClientConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl ?? "",
      timeout: config.timeout ?? DEFAULT_TIMEOUT,
      headers: config.headers ?? {},
      credentials: config.credentials,
      retryPolicy: {
        ...DEFAULT_RETRY_POLICY,
        ...config.retryPolicy,
        ...(typeof config.retries === "number" ? { retries: config.retries } : {}),
        ...(typeof config.retryDelay === "number" ? { delay: config.retryDelay } : {}),
        ...(typeof config.retryFactor === "number" ? { factor: config.retryFactor } : {}),
        ...(typeof config.retryJitter === "boolean" ? { jitter: config.retryJitter } : {}),
      },
      responseType: config.responseType ?? DEFAULT_RESPONSE_TYPE,
      serializeBody: config.serializeBody ?? defaultBodySerializer,
      parseResponse: (config.parseResponse ?? defaultResponseParser) as typeof defaultResponseParser,
      fetchFn: config.fetchFn,
    };
  }

  /**
   * Registers a request interceptor.
   *
   * @param interceptor Interceptor function to mutate request config.
   * @returns Unsubscribe callback that removes the interceptor.
   */
  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      this.requestInterceptors = this.requestInterceptors.filter((item) => item !== interceptor);
    };
  }

  /**
   * Registers a response interceptor.
   *
   * @typeParam T Response payload type.
   * @param interceptor Interceptor function to mutate response objects.
   * @returns Unsubscribe callback that removes the interceptor.
   */
  addResponseInterceptor<T>(interceptor: ResponseInterceptor<T>): () => void {
    this.responseInterceptors.push(interceptor as ResponseInterceptor);
    return () => {
      this.responseInterceptors = this.responseInterceptors.filter((item) => item !== interceptor);
    };
  }

  /**
   * Performs an HTTP request and returns a typed response envelope.
   *
   * @typeParam T Parsed response payload type.
   * @param url Relative or absolute request URL.
   * @param config Per-request configuration overrides.
   * @returns Typed HTTP response envelope.
   */
  async request<T>(url: string, config: RequestConfig = {}): Promise<HttpResponse<T>> {
    const path = config.absoluteUrl ? url : joinUrl(this.config.baseUrl, url);
    const resolvedUrl = appendQueryParams(path, config.params);

    let resolvedConfig: RequestConfig & { url: string } = {
      ...config,
      url: resolvedUrl,
    };

    for (const interceptor of this.requestInterceptors) {
      resolvedConfig = await interceptor(resolvedConfig);
    }

    const retryPolicy = {
      ...this.config.retryPolicy,
      ...(resolvedConfig.retryPolicy ?? {}),
      ...(typeof resolvedConfig.retries === "number" ? { retries: resolvedConfig.retries } : {}),
      ...(typeof resolvedConfig.retryDelay === "number" ? { delay: resolvedConfig.retryDelay } : {}),
      ...(typeof resolvedConfig.retryFactor === "number"
        ? { factor: resolvedConfig.retryFactor }
        : {}),
      ...(typeof resolvedConfig.retryJitter === "boolean"
        ? { jitter: resolvedConfig.retryJitter }
        : {}),
    };

    return this.executeWithRetry<T>(resolvedConfig.url, resolvedConfig, retryPolicy);
  }

  private async executeWithRetry<T>(
    url: string,
    config: RequestConfig,
    retryPolicy: RetryPolicy,
  ): Promise<HttpResponse<T>> {
    const retries = retryPolicy.retries ?? 0;
    const factor = retryPolicy.factor ?? 2;
    const baseDelay = retryPolicy.delay ?? 300;
    const jitter = retryPolicy.jitter ?? true;
    let attempt = 0;

    while (attempt <= retries) {
      try {
        return await this.execute<T>(url, config);
      } catch (error) {
        const shouldRetry = this.shouldRetry(error, config, retryPolicy);
        if (!shouldRetry || attempt >= retries) {
          throw error;
        }
        const rawDelay = baseDelay * Math.pow(factor, attempt);
        const waitTime = jitter ? rawDelay * (0.5 + Math.random() * 0.5) : rawDelay;
        await sleep(waitTime);
        attempt += 1;
      }
    }

    throw new Error("Unreachable retry branch");
  }

  private shouldRetry(error: unknown, config: RequestConfig, retryPolicy: RetryPolicy): boolean {
    const method = (config.method ?? "GET").toUpperCase() as HttpMethod;

    if (!retryPolicy.retryOnMethods?.includes(method)) {
      return false;
    }

    if (error instanceof HttpError) {
      return retryPolicy.retryOnStatus?.includes(error.status) ?? false;
    }

    return error instanceof TypeError;
  }

  private async execute<T>(url: string, config: RequestConfig): Promise<HttpResponse<T>> {
    const timeout = config.timeout ?? this.config.timeout;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const signal = config.signal ? anySignal([config.signal, controller.signal]) : controller.signal;

    const fetchFn = this.config.fetchFn ?? globalThis.fetch;

    if (!fetchFn) {
      throw new Error("fetch is not available in this runtime");
    }

    const {
      params: _params,
      absoluteUrl: _absoluteUrl,
      timeout: _timeout,
      retryPolicy: _retryPolicy,
      retries: _retries,
      retryDelay: _retryDelay,
      retryFactor: _retryFactor,
      retryJitter: _retryJitter,
      responseType,
      parseResponse,
      serializeBody,
      signal: _externalSignal,
      body,
      headers,
      ...requestInit
    } = config;

    const method = (config.method ?? "GET") as HttpMethod;
    const mergedHeaders = mergeHeaders(this.config.headers, headers);

    const payload = BODYLESS_METHODS.has(method)
      ? undefined
      : (serializeBody ?? this.config.serializeBody)(body, mergedHeaders, config);

    try {
      const response = await fetchFn(url, {
        ...requestInit,
        method,
        headers: mergedHeaders,
        body: payload,
        signal,
        credentials: config.credentials ?? this.config.credentials,
      });

      if (!response.ok) {
        const errorData = await parseErrorBody(response);
        throw new HttpError(response.status, response.statusText, response, {
          data: errorData,
          url,
          method,
        });
      }

      const parser = (parseResponse ?? this.config.parseResponse) as typeof defaultResponseParser;
      const parsedData = await parser<T>(response, responseType ?? this.config.responseType);

      let parsedResponse: HttpResponse<T> = {
        data: parsedData,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        ok: response.ok,
        raw: response,
      };

      for (const interceptor of this.responseInterceptors) {
        parsedResponse = (await interceptor(
          parsedResponse as HttpResponse<unknown>,
        )) as HttpResponse<T>;
      }

      return parsedResponse;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Executes a GET request.
   *
   * @typeParam T Parsed response payload type.
   * @param url Relative or absolute request URL.
   * @param config GET-compatible request configuration.
   * @returns Typed HTTP response envelope.
   */
  get<T>(url: string, config?: Omit<RequestConfig, "method" | "body">) {
    return this.request<T>(url, { ...config, method: "GET" });
  }

  /**
   * Executes a POST request.
   *
   * @typeParam T Parsed response payload type.
   * @param url Relative or absolute request URL.
   * @param body Request body value before serialization.
   * @param config POST-compatible request configuration.
   * @returns Typed HTTP response envelope.
   */
  post<T>(url: string, body?: unknown, config?: Omit<RequestConfig, "method" | "body">) {
    return this.request<T>(url, { ...config, method: "POST", body });
  }

  /**
   * Executes a PUT request.
   *
   * @typeParam T Parsed response payload type.
   * @param url Relative or absolute request URL.
   * @param body Request body value before serialization.
   * @param config PUT-compatible request configuration.
   * @returns Typed HTTP response envelope.
   */
  put<T>(url: string, body?: unknown, config?: Omit<RequestConfig, "method" | "body">) {
    return this.request<T>(url, { ...config, method: "PUT", body });
  }

  /**
   * Executes a PATCH request.
   *
   * @typeParam T Parsed response payload type.
   * @param url Relative or absolute request URL.
   * @param body Request body value before serialization.
   * @param config PATCH-compatible request configuration.
   * @returns Typed HTTP response envelope.
   */
  patch<T>(url: string, body?: unknown, config?: Omit<RequestConfig, "method" | "body">) {
    return this.request<T>(url, { ...config, method: "PATCH", body });
  }

  /**
   * Executes a DELETE request.
   *
   * @typeParam T Parsed response payload type.
   * @param url Relative or absolute request URL.
   * @param config DELETE-compatible request configuration.
   * @returns Typed HTTP response envelope.
   */
  delete<T>(url: string, config?: Omit<RequestConfig, "method" | "body">) {
    return this.request<T>(url, { ...config, method: "DELETE" });
  }

  /**
   * Executes a streaming POST request.
   *
   * @param url Relative or absolute request URL.
   * @param body Request body value before serialization.
   * @param config Streaming request configuration.
   * @returns Response envelope where `data` is a readable stream or `null`.
   */
  stream(url: string, body?: unknown, config?: Omit<RequestConfig, "method" | "body" | "responseType">) {
    return this.request<ReadableStream<Uint8Array> | null>(url, {
      ...config,
      method: "POST",
      body,
      responseType: "stream",
    });
  }
}
