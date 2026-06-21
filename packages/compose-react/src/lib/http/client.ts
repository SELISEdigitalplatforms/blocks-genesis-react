import { getRuntimeEnv } from "@/lib/runtime-env";
import { AUTH_ENDPOINTS } from "@/constants/endpoint.constant";
import type { AuthTokenPair } from "@/models";
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

export class HttpClient {
  private static isRefreshing = false;
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  private static requestQueue: RequestQueueItem<any>[] = [];
  private static readonly excludedPaths = ["/login", "/signup"];

  private baseURL: string | (() => string);
  private blocksKey: string | (() => string);
  private onTokenRefresh?: () => Promise<AuthTokenPair>;
  private onUnauthorized?: (error: unknown) => void;

  constructor(config: HttpClientConfig) {
    this.baseURL = config.baseURL;
    this.blocksKey = config.blocksKey;
    this.onTokenRefresh = config.onTokenRefresh;
    this.onUnauthorized = config.onUnauthorized;
  }

  private getBaseURL(): string {
    return typeof this.baseURL === "function" ? this.baseURL() : this.baseURL;
  }

  private getBlocksKey(): string {
    return typeof this.blocksKey === "function"
      ? this.blocksKey()
      : this.blocksKey;
  }

  private normalizeHeaders(
    headers?: HeadersInitValue,
    skipBlocksKey?: boolean,
  ): Headers {
    const normalizedHeaders = new Headers({
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(!skipBlocksKey && this.getBlocksKey()
        ? { "X-Blocks-Key": this.getBlocksKey() }
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
    if (HttpClient.isRefreshing) return;

    try {
      HttpClient.isRefreshing = true;
      if (this.onTokenRefresh) await this.onTokenRefresh();

      const formData = new URLSearchParams();
      formData.append("grant_type", "refresh_token");
      formData.append("refresh_token", '""');
      formData.append(
        "client_id",
        getRuntimeEnv("BLOCKS_OIDC_CLIENT_ID") || "",
      );
      const baseUrl = window?.process?.env.userBaseUrl || "";
      const url = `${baseUrl}${AUTH_ENDPOINTS.OIDC_TOKEN}?tenant_id=${this.getBlocksKey()}`;
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Blocks-Key": this.getBlocksKey(),
        },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to refresh token");

      while (HttpClient.requestQueue.length > 0) {
        const queued = HttpClient.requestQueue.shift()!;
        queued.retry().then(queued.resolve).catch(queued.reject);
      }
    } catch (error) {
      if (this.onUnauthorized) this.onUnauthorized(error);

      const queuedRequests = HttpClient.requestQueue;
      for (const queued of queuedRequests) {
        queued.retry().then(queued.resolve).catch(queued.reject);
      }

      const queryClient = getQueryClient();
      useAuthStore.getState().resetAuthStore();
      useProjectStore.getState().resetProjectStore();
      queryClient.cancelQueries();
      queryClient.clear();

      if (typeof window !== "undefined") {
        const { pathname } = window.location;

        const shouldRedirect = !HttpClient.excludedPaths.some((path) =>
          pathname.startsWith(path),
        );

        if (shouldRedirect) {
          window.location.replace("/login");
        }
      }
    } finally {
      HttpClient.isRefreshing = false;
      HttpClient.requestQueue = [];
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

    const fullUrl = absoluteUrl ? url : `${this.getBaseURL()}${url}`;
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
          HttpClient.requestQueue.push({
            url,
            requestOption,
            retry: () =>
              this.request(url, { ...requestOption, skipTokenRotation: true }),
            resolve,
            reject,
          });
          if (!HttpClient.isRefreshing) this.refreshAccessToken();
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
      skipTokenRotation = false,
    } = options || {};

    const fullUrl = absoluteUrl ? url : `${this.getBaseURL()}${url}`;
    const normalizedHeaders = this.normalizeHeaders(headers, skipBlocksKey);

    const config: RequestInit = {
      method: "POST",
      headers: normalizedHeaders,
      credentials: withCredentials ? "include" : "omit",
      body: typeof body === "string" ? body : JSON.stringify(body),
    };

    const response = await fetch(fullUrl, config);

    if (response.status === 401 && !skipTokenRotation) {
      return new Promise<ReadableStream<Uint8Array>>((resolve, reject) => {
        HttpClient.requestQueue.push({
          url,
          retry: () =>
            this.stream(url, body, headers, {
              absoluteUrl,
              skipBlocksKey,
              withCredentials,
              skipTokenRotation: true,
            }),
          resolve,
          reject,
        });

        if (!HttpClient.isRefreshing) {
          this.refreshAccessToken();
        }
      });
    }

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
