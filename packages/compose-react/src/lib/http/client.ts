import { getRuntimeEnv } from "@/lib/runtime-env";
import { resolveBaseUrl } from "./util";
import { AUTH_ENDPOINTS } from "@/constants/endpoint.constant";
import type { AuthTokenPair } from "@/models";
import type {
  HttpClientConfig,
  HttpClientOptions,
  HeadersInitValue,
  RequestOptions,
  RequestBody,
} from "./types";
import { HttpError } from "./error";
import { getQueryClient } from "@/providers/query-client";
import { useAuthStore } from "@/store/auth.store";
import { useProjectStore } from "@/store/project.store";

const DEFAULT_EXCLUDED_PATHS = ["/login", "/signup"];
const DEFAULT_LOGIN_REDIRECT_PATH = "/login";

export class HttpClient {
  private baseURL: string | (() => string);
  private blocksKey: string | (() => string);
  private onTokenRefresh?: () => Promise<AuthTokenPair>;
  private onUnauthorized?: (error: unknown) => void;
  private excludedPaths: string[];
  private loginRedirectPath: string;
  private autoRedirectOnAuthFailure: boolean;

  // Per-instance, not module-level — two HttpClient instances pointed at
  // different baseURLs/tenants must never share a refresh lock.
  private refreshPromise: Promise<void> | null = null;

  constructor(config: HttpClientConfig) {
    this.baseURL = config.baseURL;
    this.blocksKey = config.blocksKey;
    this.onTokenRefresh = config.onTokenRefresh;
    this.onUnauthorized = config.onUnauthorized;
    this.excludedPaths = config.excludedPaths ?? DEFAULT_EXCLUDED_PATHS;
    this.loginRedirectPath =
      config.loginRedirectPath ?? DEFAULT_LOGIN_REDIRECT_PATH;
    this.autoRedirectOnAuthFailure = config.autoRedirectOnAuthFailure ?? true;
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
    } else if (Array.isArray(headers)) {
      headers.forEach(([key, value]) => normalizedHeaders.set(key, value));
    } else if (headers) {
      Object.entries(headers).forEach(([key, value]) =>
        normalizedHeaders.set(key, value),
      );
    }

    return normalizedHeaders;
  }

  // Shared by request() and stream() so binary/form bodies are handled
  // identically in both — stream() previously JSON.stringify'd
  // everything unconditionally, silently mangling FormData/Blob/File.
  private prepareBody(
    body: RequestBody,
    normalizedHeaders: Headers,
  ): BodyInit | undefined {
    if (body === undefined || body === null) return undefined;

    if (
      body instanceof FormData ||
      body instanceof URLSearchParams ||
      body instanceof File ||
      body instanceof Blob
    ) {
      normalizedHeaders.delete("Content-Type");
      return body;
    }

    if (typeof body === "string") return body;

    return JSON.stringify(body);
  }

  // Ensures only one refresh request is ever in flight per instance.
  // Concurrent 401s from get/post/.../stream all await this same
  // promise instead of each independently racing to refresh.
  private refreshAccessToken(): Promise<void> {
    if (!this.refreshPromise) {
      this.refreshPromise = this.performRefresh().finally(() => {
        this.refreshPromise = null;
      });
    }
    return this.refreshPromise;
  }

  private async performRefresh(): Promise<void> {
    try {
      if (this.onTokenRefresh) await this.onTokenRefresh();

      const clientId = getRuntimeEnv("BLOCKS_OIDC_CLIENT_ID");
      // Resolve IAM the same way iamClient does, so a blocks-iam preview refreshes
      // against itself rather than shared dev. Deliberately NOT this.getBaseURL():
      // non-IAM apps refresh against IAM, not against their own service. Falls back
      // to BLOCKS_IAM_BASE_URL when userBaseUrl has not been set yet.
      const baseUrl = resolveBaseUrl("user");
      const blocksKey = this.getBlocksKey();

      if (!clientId || !baseUrl || !blocksKey) {
        throw new Error("Missing OIDC refresh configuration");
      }

      const formData = new URLSearchParams();
      formData.append("grant_type", "refresh_token");
      // Placeholder — the real refresh token lives in an HttpOnly
      // cookie and is sent automatically via credentials: "include".
      // The OIDC endpoint just requires this field to be present.
      formData.append("refresh_token", '""');
      formData.append("client_id", clientId);

      const url = `${baseUrl.replace(/\/$/, "")}${AUTH_ENDPOINTS.OIDC_TOKEN}?tenant_id=${blocksKey}`;

      const response = await fetch(url, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Blocks-Key": blocksKey,
        },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to refresh token");
    } catch (error) {
      this.handleRefreshFailure(error);
      throw error;
    }
  }

  // Runs exactly once per failed refresh, regardless of how many
  // concurrent requests were waiting on it.
  private handleRefreshFailure(error: unknown): void {
    if (this.onUnauthorized) this.onUnauthorized(error);

    const queryClient = getQueryClient();
    useAuthStore.getState().resetAuthStore();
    useProjectStore.getState().resetProjectStore();
    queryClient.cancelQueries();
    queryClient.clear();

    if (!this.autoRedirectOnAuthFailure) return;
    if (typeof window === "undefined") return;

    const { pathname } = window.location;
    const shouldRedirect = !this.excludedPaths.some((path) =>
      pathname.startsWith(path),
    );

    if (shouldRedirect) {
      window.location.replace(this.loginRedirectPath);
    }
  }

  private async throwIfNotOk(response: Response): Promise<void> {
    if (response.ok) return;
    const errorBody = await response.json().catch(() => ({}));
    throw new HttpError(response.status, {
      errors: errorBody?.errors || errorBody || { general: "Request failed" },
    });
  }

  private normalizeRequestError(error: unknown): HttpError {
    if (error instanceof HttpError) return error;
    if (typeof error === "object" && error !== null) {
      return new HttpError(500, {
        errors: error as Record<string, string | string[]>,
      });
    }
    return new HttpError(500, { errors: { general: "Something went wrong" } });
  }

  private async parseSuccessResponse<T>(response: Response): Promise<T> {
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
      signal,
    } = requestOption;

    const fullUrl = absoluteUrl ? url : `${this.getBaseURL()}${url}`;
    const normalizedHeaders = this.normalizeHeaders(headers, skipBlocksKey);

    const config: RequestInit = {
      method,
      headers: normalizedHeaders,
      credentials: withCredentials ? "include" : "omit",
      body: this.prepareBody(body, normalizedHeaders),
      signal,
    };

    try {
      const response = await fetch(fullUrl, config);

      if (response.status === 401 && !skipTokenRotation) {
        try {
          await this.refreshAccessToken();
        } catch {
          throw new HttpError(401, {
            errors: { general: "Session expired" },
          });
        }
        return this.request<T>(url, {
          ...requestOption,
          skipTokenRotation: true,
        });
      }

      await this.throwIfNotOk(response);

      return this.parseSuccessResponse<T>(response);
    } catch (error) {
      throw this.normalizeRequestError(error);
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
      signal,
    } = options || {};

    const fullUrl = absoluteUrl ? url : `${this.getBaseURL()}${url}`;
    const normalizedHeaders = this.normalizeHeaders(headers, skipBlocksKey);

    try {
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: normalizedHeaders,
        credentials: withCredentials ? "include" : "omit",
        body: this.prepareBody(body, normalizedHeaders),
        signal,
      });

      if (response.status === 401 && !skipTokenRotation) {
        try {
          await this.refreshAccessToken();
        } catch {
          throw new HttpError(401, {
            errors: { general: "Session expired" },
          });
        }
        return this.stream(url, body, headers, {
          ...options,
          skipTokenRotation: true,
        });
      }

      await this.throwIfNotOk(response);

      if (!response.body) {
        throw new HttpError(response.status, {
          errors: { general: "Response body is not readable" },
        });
      }

      return response.body;
    } catch (error) {
      throw this.normalizeRequestError(error);
    }
  }
}
