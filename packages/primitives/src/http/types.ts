export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";

/**
 * @type HttpClientConfig
 * @description - The HTTP client configuration type.
 * @property {string} baseUrl - The base URL for the HTTP client.
 * @property {number} timeout - The timeout in milliseconds for the HTTP client.
 * @property {Record<string, string>} headers - The default headers for the HTTP client.
 * @property {number} retries - The number of retries for the HTTP client.
 * @property {number} retryDelay - The delay in milliseconds between retries for the HTTP client.
 */
export interface HttpClientConfig {
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
  retries?: number;
  retryDelay?: number;
}

/**
 * @type RequestConfig
 * @description - The HTTP request configuration type.
 * @property {HttpMethod} method - The HTTP method for the request.
 * @property {Record<string, string | number | boolean>} params - The query parameters for the request.
 * @property {unknown} body - The request body.
 * @property {number} timeout - The timeout in milliseconds for the request.
 * @property {number} retries - The number of retries for the request.
 * @property {number} retryDelay - The delay in milliseconds between retries for the request.
 * @property {AbortSignal} signal - The abort signal for the request.
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
 * @type HttpResponse
 * @description - The HTTP response type.
 * @template T - The type of the response data.
 * @property {T} data - The response data.
 * @property {number} status - The HTTP status code.
 * @property {string} statusText - The HTTP status text.
 * @property {Headers} headers - The response headers.
 * @property {boolean} ok - Whether the response is OK.
 */
export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  ok: boolean;
}

/**
 * @type RequestInterceptor
 * @description - The HTTP request interceptor type.
 * @param {RequestConfig & { url: string }} config - The request configuration.
 * @returns The modified request configuration.
 */
export type RequestInterceptor = (
  config: RequestConfig & { url: string },
) => RequestConfig & { url: string };

/**
 * @type ResponseInterceptor
 * @description - The HTTP response interceptor type.
 * @param {HttpResponse<T>} response - The response object.
 * @returns {HttpResponse<T>} - The modified response object.
 */
export type ResponseInterceptor<T = unknown> = (response: HttpResponse<T>) => HttpResponse<T>;
