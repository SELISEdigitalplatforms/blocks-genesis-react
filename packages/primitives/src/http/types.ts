export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";

/**
 * HTTP client configuration.
 * @param baseUrl - The base URL for the HTTP client.
 * @param timeout - The timeout in milliseconds for the HTTP client.
 * @param headers - The default headers for the HTTP client.
 * @param retries - The number of retries for the HTTP client.
 * @param retryDelay - The delay in milliseconds between retries for the HTTP client.
 */
export interface HttpClientConfig {
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
  retries?: number;
  retryDelay?: number;
}

/**
 * HTTP request configuration.
 * @param method - The HTTP method for the request.
 * @param params - The query parameters for the request.
 * @param body - The request body.
 * @param timeout - The timeout in milliseconds for the request.
 * @param retries - The number of retries for the request.
 * @param retryDelay - The delay in milliseconds between retries for the request.
 * @param signal - The abort signal for the request.
 */
export interface RequestConfig extends Omit<RequestInit, "method" | "body"> {
  method?: HttpMethod;
  params?: Record<string, string | number | boolean>;
  body?: unknown;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  signal?: AbortSignal;
}

/**
 * HTTP response.
 * @param data - The response data.
 * @param status - The HTTP status code.
 * @param statusText - The HTTP status text.
 * @param headers - The response headers.
 * @param ok - Whether the response is OK.
 */
export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  ok: boolean;
}

/**
 * HTTP request interceptor.
 * @param config - The request configuration.
 * @returns The modified request configuration.
 */
export type RequestInterceptor = (
  config: RequestConfig & { url: string },
) => RequestConfig & { url: string };

/**
 * HTTP response interceptor.
 * @param response - The response object.
 * @returns The modified response object.
 */
export type ResponseInterceptor<T = unknown> = (response: HttpResponse<T>) => HttpResponse<T>;
