export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";

export interface HttpClientConfig {
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
  retries?: number;
  retryDelay?: number;
}

export interface RequestConfig extends Omit<RequestInit, "method" | "body"> {
  method?: HttpMethod;
  params?: Record<string, string | number | boolean>;
  body?: unknown;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  signal?: AbortSignal;
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  ok: boolean;
}

export type RequestInterceptor = (
  config: RequestConfig & { url: string },
) => RequestConfig & { url: string };

export type ResponseInterceptor<T = unknown> = (response: HttpResponse<T>) => HttpResponse<T>;

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly response: Response,
    message?: string,
  ) {
    super(message ?? `HTTP ${status}: ${statusText}`);
    this.name = "HttpError";
  }
}
