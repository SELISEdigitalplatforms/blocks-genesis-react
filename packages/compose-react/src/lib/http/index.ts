import { getRuntimeEnv } from "@/lib/runtime-env";
import { AUTH_OIDC_ENDPOINTS } from "@/constants/endpoint.constant";
import type { AuthTokenPair } from "@/types";
import type {
  RequestQueueItem,
  HttpClientConfig,
  HttpClientOptions,
  HeadersInitValue,
  RequestOptions,
  RequestBody,
} from "./types";
import { HttpError } from "./error";
import { getQueryClient } from "@/providers";
import { useAuthStore, useProjectStore } from "@/store";

let isRefreshing = false;
let requestQueue: RequestQueueItem<unknown>[] = [];

export class HttpClient {
  private baseURL: string;
  private blocksKey: string;
  private onTokenRefresh?: () => Promise<AuthTokenPair>;
  private onUnauthorized?: (error: unknown) => void;

  constructor(config: HttpClientConfig) {
    this.baseURL = config.baseURL;
    this.blocksKey = config.blocksKey;
    this.onTokenRefresh = config.onTokenRefresh;
    this.onUnauthorized = config.onUnauthorized;
  }

  private normalizeHeaders(
    headers?: HeadersInitValue,
    skipBlocksKey?: boolean,
  ): Headers {
    const normalizedHeaders = new Headers({
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(!skipBlocksKey && this.blocksKey
        ? { "X-Blocks-Key": this.blocksKey }
        : {}),
    });

    if (headers instanceof Headers) {
      headers.forEach((value, key) => normalizedHeaders.set(key, value));
      return normalizedHeaders;
    }

    if (Array.isArray(headers)) {
      headers.forEach(([key, value]) => normalizedHeaders.set(key, value));
      return normalizedHeaders;
    }

    if (headers) {
      Object.entries(headers).forEach(([key, value]) =>
        normalizedHeaders.set(key, value),
      );
    }

    return normalizedHeaders;
  }

  private async refreshAccessToken() {
    if (isRefreshing) return;

    try {
      isRefreshing = true;
      if (this.onTokenRefresh) await this.onTokenRefresh();

      const formData = new URLSearchParams();
      formData.append("grant_type", "refresh_token");
      formData.append("refresh_token", '""');
      formData.append(
        "client_id",
        getRuntimeEnv("BLOCKS_OIDC_CLIENT_ID") || "",
      );
      const baseUrl = window?.process?.env.userBaseUrl || "";
      const url = `${baseUrl}${AUTH_OIDC_ENDPOINTS.OIDC_TOKEN}?tenant_id=${this.blocksKey}`;
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Blocks-Key": this.blocksKey,
        },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to refresh token");

      while (requestQueue.length > 0) {
        const { url, requestOption, resolve, reject } = requestQueue.shift()!;
        this.request(url, requestOption).then(resolve).catch(reject);
      }
    } catch (error) {
      if (this.onUnauthorized) this.onUnauthorized(error);

      while (requestQueue.length > 0) {
        const queued = requestQueue.shift();
        queued?.reject(error);
      }

      const queryClient = getQueryClient();
      useAuthStore.getState().reset();
      useProjectStore.getState().reset();
      queryClient.cancelQueries();
      queryClient.clear();
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("login")
      ) {
        window.location.replace("/login");
      }
    } finally {
      isRefreshing = false;
      requestQueue = [];
    }
  }

  private async request<T = unknown>(
    url: string,
    requestOption: RequestOptions,
  ): Promise<T> {
    const {
      method,
      body,
      headers,
      absoluteUrl = false,
      skipBlocksKey = false,
      withCredentials = true,
      skipTokenRotation = false,
    } = requestOption;

    const fullUrl = absoluteUrl ? url : `${this.baseURL}${url}`;
    const normalizedHeaders = this.normalizeHeaders(headers, skipBlocksKey);

    const config: RequestInit = {
      method,
      headers: normalizedHeaders,
      credentials: withCredentials ? "include" : "omit",
    };

    if (body !== undefined && body !== null) {
      if (
        body instanceof FormData ||
        body instanceof URLSearchParams ||
        body instanceof File ||
        body instanceof Blob
      ) {
        normalizedHeaders.delete("Content-Type");
        config.body = body;
      } else if (typeof body === "string") {
        config.body = body;
      } else {
        config.body = JSON.stringify(body);
      }
    }

    try {
      const response = await fetch(fullUrl, config);

      if (response.status === 401 && !skipTokenRotation) {
        return new Promise<T>((resolve, reject) => {
          requestQueue.push({
            url,
            requestOption,
            resolve: resolve as (value: unknown | PromiseLike<unknown>) => void,
            reject,
          });
          if (!isRefreshing) this.refreshAccessToken();
        });
      }

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new HttpError(response.status, {
          errors: errorBody?.errors ||
            errorBody || { general: "Request failed" },
        });
      }

      const contentType = response.headers.get("content-type")?.toLowerCase();
      if (!contentType) return { success: true, status: response.status } as T;

      if (contentType.includes("text/html")) {
        throw new HttpError(response.status, {
          errors: { general: "Unexpected HTML response from server" },
        });
      }

      if (contentType.includes("text/"))
        return (await response.text()) as unknown as T;

      if (
        contentType.includes("image/") ||
        contentType.includes("application/octet-stream") ||
        contentType.includes("application/pdf")
      ) {
        return (await response.blob()) as unknown as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof HttpError) throw error;

      if (typeof error === "object" && error !== null) {
        throw new HttpError(500, {
          errors: error as Record<string, string | string[]>,
        });
      }

      throw new HttpError(500, {
        errors: { general: "Something went wrong" },
      });
    }
  }

  get<T = unknown>(
    url: string,
    headers?: HeadersInitValue,
    options?: HttpClientOptions,
  ): Promise<T> {
    return this.request<T>(url, { method: "GET", headers, ...options });
  }

  post<T = unknown>(
    url: string,
    body: RequestBody,
    headers?: HeadersInitValue,
    options?: HttpClientOptions,
  ): Promise<T> {
    return this.request<T>(url, { method: "POST", body, headers, ...options });
  }

  put<T = unknown>(
    url: string,
    body: RequestBody,
    headers?: HeadersInitValue,
    options?: HttpClientOptions,
  ): Promise<T> {
    return this.request<T>(url, { method: "PUT", body, headers, ...options });
  }

  patch<T = unknown>(
    url: string,
    body: RequestBody,
    headers?: HeadersInitValue,
    options?: HttpClientOptions,
  ): Promise<T> {
    return this.request<T>(url, { method: "PATCH", body, headers, ...options });
  }

  delete<T = unknown>(
    url: string,
    headers?: HeadersInitValue,
    options?: HttpClientOptions,
  ): Promise<T> {
    return this.request<T>(url, { method: "DELETE", headers, ...options });
  }

  async stream(
    url: string,
    body: RequestBody,
    headers?: HeadersInitValue,
    options?: HttpClientOptions,
  ): Promise<ReadableStream<Uint8Array>> {
    const {
      absoluteUrl = false,
      skipBlocksKey = false,
      withCredentials = true,
    } = options || {};

    const fullUrl = absoluteUrl ? url : `${this.baseURL}${url}`;
    const normalizedHeaders = this.normalizeHeaders(headers, skipBlocksKey);

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: normalizedHeaders,
      credentials: withCredentials ? "include" : "omit",
      body: typeof body === "string" ? body : JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new HttpError(response.status, {
        errors: errorBody?.errors || errorBody,
      });
    }

    if (!response.body) {
      throw new Error("Response body is not readable");
    }

    return response.body;
  }
}
