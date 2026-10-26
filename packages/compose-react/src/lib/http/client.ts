import { getRuntimeEnv } from "@/lib/runtime-env";
import { resolveBaseUrl } from "./util";
import { AUTH_ENDPOINTS } from "@/constants/endpoint.constant";
import type { AuthTokenPair } from "@/models";
import type {
  HttpClientConfig,
  HttpRequestFailure,
  HttpClientOptions,
  HeadersInitValue,
  RequestOptions,
  RequestBody,
  SessionTenantGuard,
} from "./types";
import { HttpError } from "./error";
import { timeoutSignal, withSessionLock } from "./session-lock";
import { getQueryClient } from "@/providers/query-client";
import { useAuthStore } from "@/store/auth.store";
import { useProjectStore } from "@/store/project.store";

const DEFAULT_EXCLUDED_PATHS = ["/login", "/signup"];
const DEFAULT_LOGIN_REDIRECT_PATH = "/login";

/**
 * A refresh runs inside the session lock, so one that never answers would hold every tab. Kept
 * below `SESSION_LOCK_WAIT_MS`.
 */
const REFRESH_TIMEOUT_MS = 20_000;

/**
 * IAM's answer to a refresh token that was replaced by opening, leaving or switching a project. The
 * cookie may already hold that replacement -- set by another tab -- so it is not a sign-out by
 * itself.
 */
const SESSION_CHANGED = "session_changed";

const isSameTenant = (a: string, b: string): boolean =>
  a.toLowerCase() === b.toLowerCase();

/**
 * Thrown instead of retrying a request after a refresh moved the session to a tenant other than
 * the one the page was showing when the request started. Sending it again would answer the page
 * with another tenant's data.
 */
const sessionMovedError = (): HttpError =>
  new HttpError(409, {
    errors: {
      general:
        "The session moved to another tenant, so the request was not sent again",
    },
  });

export class HttpClient {
  private baseURL: string | (() => string);
  private blocksKey: string | (() => string);
  private onTokenRefresh?: () => Promise<AuthTokenPair>;
  private onUnauthorized?: (error: unknown) => void;
  private excludedPaths: string[];
  private loginRedirectPath: string;
  private autoRedirectOnAuthFailure: boolean;
  private onError?: (failure: HttpRequestFailure) => void;

  // Keyed by refresh target, not per instance.
  //
  // The lock used to be an instance field, on the reasoning that two clients pointed at different
  // baseURLs or tenants must not share one. That reasoning is sound but did not describe the actual
  // instances: iamClient, logicClient and notificationClient all carry the same blocks key, and
  // performRefresh always refreshes against IAM via resolveBaseUrl("user") using the same
  // HttpOnly refresh cookie and therefore the same server-side token lineage.
  //
  // So a single window-focus event could fire three concurrent rotations of one refresh token. The
  // server rotates an impersonated lineage twice more per refresh, so up to six writes raced; the
  // losers came back invalid_grant, and handleRefreshFailure turned that into a forced redirect to
  // /login. Keying by the refresh target keeps the original guarantee for clients that genuinely
  // differ while collapsing the ones that do not into one in-flight refresh.
  //
  // Each entry resolves with the tenant the session was confirmed in after the refresh, or null when
  // that could not be checked.
  private static readonly refreshPromises = new Map<
    string,
    Promise<string | null>
  >();

  private static sessionGuard: SessionTenantGuard | null = null;

  /**
   * Registers the check run after every refresh (see `SessionTenantGuard`). Returns a function that
   * removes it again, unless another guard has replaced it since.
   */
  static setSessionGuard(guard: SessionTenantGuard): () => void {
    HttpClient.sessionGuard = guard;
    return () => {
      if (HttpClient.sessionGuard === guard) HttpClient.sessionGuard = null;
    };
  }

  private static expectedTenant(skip: boolean): string | null {
    if (skip || !HttpClient.sessionGuard) return null;
    try {
      return HttpClient.sessionGuard.expectedTenant();
    } catch {
      return null;
    }
  }

  private static async confirmSessionTenant(): Promise<string | null> {
    if (!HttpClient.sessionGuard) return null;
    try {
      return await HttpClient.sessionGuard.confirmTenant();
    } catch {
      // Unknown is not "moved": the server refuses a refresh that would cross tenants, so the
      // retry goes ahead as it did before this check existed.
      return null;
    }
  }

  /** Whether a request started for `expected` must not be retried in `confirmed`. */
  private static hasSessionMoved(
    expected: string | null,
    confirmed: string | null,
  ): boolean {
    return !!expected && !!confirmed && !isSameTenant(expected, confirmed);
  }

  constructor(config: HttpClientConfig) {
    this.baseURL = config.baseURL;
    this.blocksKey = config.blocksKey;
    this.onTokenRefresh = config.onTokenRefresh;
    this.onUnauthorized = config.onUnauthorized;
    this.excludedPaths = config.excludedPaths ?? DEFAULT_EXCLUDED_PATHS;
    this.loginRedirectPath =
      config.loginRedirectPath ?? DEFAULT_LOGIN_REDIRECT_PATH;
    this.autoRedirectOnAuthFailure = config.autoRedirectOnAuthFailure ?? true;
    this.onError = config.onError;
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

  // Identifies the credential a refresh actually rotates: the IAM base URL performRefresh posts to,
  // plus the tenant key it sends. Two clients that resolve to the same pair are rotating the same
  // token and must share one lock; two that do not are independent and must not.
  private refreshLockKey(): string {
    return `${resolveBaseUrl("user")}::${this.getBlocksKey()}`;
  }

  // Ensures only one refresh request is ever in flight per refresh target.
  // Concurrent 401s from get/post/.../stream — across every client sharing
  // that target — all await this same promise instead of racing to refresh.
  //
  // The refresh also takes the session lock, so it never overlaps another tab's refresh, or an
  // impersonation start or stop from any tab: each of those replaces the same shared cookie.
  private refreshAccessToken(): Promise<string | null> {
    const key = this.refreshLockKey();
    const inFlight = HttpClient.refreshPromises.get(key);
    if (inFlight) return inFlight;

    const promise = withSessionLock(key, async () => {
      await this.performRefresh();
      return HttpClient.confirmSessionTenant();
    }).finally(() => {
      HttpClient.refreshPromises.delete(key);
    });
    HttpClient.refreshPromises.set(key, promise);
    return promise;
  }

  /**
   * Runs `fn` while holding the lock that refreshes and impersonation changes share across every
   * tab (see `withSessionLock`). Requests made inside must pass `skipTokenRotation` and use
   * `refreshWithinSessionLock` instead: the client's own refresh would wait for this very lock.
   */
  withSessionLock<T>(fn: () => Promise<T>): Promise<T> {
    return withSessionLock(this.refreshLockKey(), fn);
  }

  /**
   * Refreshes the access token from inside `withSessionLock`. Failure handling is the same as any
   * refresh: an unrecoverable one signs the user out.
   */
  refreshWithinSessionLock(): Promise<void> {
    return this.performRefresh();
  }

  /**
   * True for a refused refresh that only means the cookie's token was replaced by an impersonation
   * change, and the cookie now holds a working access token. Another tab can cause that, or a
   * response this tab never received.
   */
  private async isReplacedSession(response: Response): Promise<boolean> {
    const body = (await response.json().catch(() => null)) as {
      error?: unknown;
      error_description?: unknown;
    } | null;
    if (
      body?.error !== SESSION_CHANGED &&
      body?.error_description !== SESSION_CHANGED
    ) {
      return false;
    }
    return (await HttpClient.confirmSessionTenant()) !== null;
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
        signal: timeoutSignal(REFRESH_TIMEOUT_MS),
      });

      if (!response.ok) {
        // Not a sign-out: the retry that follows is held to the same tenant check as after any
        // other refresh.
        if (await this.isReplacedSession(response)) return;
        throw new Error("Failed to refresh token");
      }
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

  /**
   * Normalises a request failure and hands it to `onError` before it is thrown.
   *
   * Reporting happens here rather than at the call sites because this is the last point at which
   * the original error still exists: `normalizeRequestError` collapses everything to an
   * `HttpError` with status 500, so afterwards a transport failure is indistinguishable from a
   * server fault. Anything `onError` throws is swallowed -- a reporting failure must never turn a
   * handled request failure into an unhandled one.
   */
  private failRequest(
    error: unknown,
    url: string,
    method: RequestOptions["method"],
  ): HttpError {
    const normalized = this.normalizeRequestError(error);

    if (this.onError) {
      try {
        this.onError({
          error,
          normalized,
          url,
          method,
          // Not already an HttpError means no HTTP response ever came back: DNS, CORS, TLS,
          // offline, abort, or a bug in this client.
          transport: !(error instanceof HttpError),
        });
      } catch {
        // Intentionally swallowed.
      }
    }

    return normalized;
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
      skipSessionCheck = false,
      signal,
    } = requestOption;

    const fullUrl = absoluteUrl ? url : `${this.getBaseURL()}${url}`;
    const normalizedHeaders = this.normalizeHeaders(headers, skipBlocksKey);
    // Read before sending: the page may move on while this request waits for a refresh.
    const expectedTenant = HttpClient.expectedTenant(skipSessionCheck);

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
        let confirmedTenant: string | null;
        try {
          confirmedTenant = await this.refreshAccessToken();
        } catch {
          throw new HttpError(401, {
            errors: { general: "Session expired" },
          });
        }
        if (HttpClient.hasSessionMoved(expectedTenant, confirmedTenant)) {
          throw sessionMovedError();
        }
        return this.request<T>(url, {
          ...requestOption,
          skipTokenRotation: true,
        });
      }

      await this.throwIfNotOk(response);

      return this.parseSuccessResponse<T>(response);
    } catch (error) {
      throw this.failRequest(error, fullUrl, method);
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
      skipSessionCheck = false,
      signal,
    } = options || {};

    const fullUrl = absoluteUrl ? url : `${this.getBaseURL()}${url}`;
    const normalizedHeaders = this.normalizeHeaders(headers, skipBlocksKey);
    const expectedTenant = HttpClient.expectedTenant(skipSessionCheck);

    try {
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: normalizedHeaders,
        credentials: withCredentials ? "include" : "omit",
        body: this.prepareBody(body, normalizedHeaders),
        signal,
      });

      if (response.status === 401 && !skipTokenRotation) {
        let confirmedTenant: string | null;
        try {
          confirmedTenant = await this.refreshAccessToken();
        } catch {
          throw new HttpError(401, {
            errors: { general: "Session expired" },
          });
        }
        if (HttpClient.hasSessionMoved(expectedTenant, confirmedTenant)) {
          throw sessionMovedError();
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
      throw this.failRequest(error, fullUrl, "POST");
    }
  }
}
