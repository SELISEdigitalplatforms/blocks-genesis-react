import {
  type HttpClientConfig,
  type RequestConfig,
  type HttpResponse,
  type RequestInterceptor,
  type ResponseInterceptor,
  HttpError,
} from "./types";

export class HttpClient {
  private config: Required<HttpClientConfig>;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(config: HttpClientConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl ?? "",
      timeout: config.timeout ?? 10_000,
      headers: config.headers ?? {},
      retries: config.retries ?? 0,
      retryDelay: config.retryDelay ?? 300,
    };
  }

  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      this.requestInterceptors = this.requestInterceptors.filter((i) => i !== interceptor);
    };
  }

  addResponseInterceptor<T>(interceptor: ResponseInterceptor<T>): () => void {
    this.responseInterceptors.push(interceptor as ResponseInterceptor);
    return () => {
      this.responseInterceptors = this.responseInterceptors.filter((i) => i !== interceptor);
    };
  }

  async request<T>(url: string, config: RequestConfig = {}): Promise<HttpResponse<T>> {
    const fullUrl = this.buildUrl(url, config.params);
    let resolvedConfig = { ...config, url: fullUrl };

    for (const interceptor of this.requestInterceptors) {
      resolvedConfig = interceptor(resolvedConfig);
    }

    const retries = config.retries ?? this.config.retries;
    const retryDelay = config.retryDelay ?? this.config.retryDelay;

    return this.executeWithRetry<T>(resolvedConfig.url, resolvedConfig, retries, retryDelay);
  }

  private async executeWithRetry<T>(
    url: string,
    config: RequestConfig,
    retriesLeft: number,
    retryDelay: number,
  ): Promise<HttpResponse<T>> {
    try {
      return await this.execute<T>(url, config);
    } catch (error) {
      const isRetryable =
        (error instanceof HttpError && error.status >= 500) || error instanceof TypeError; // network error

      if (retriesLeft > 0 && isRetryable) {
        await sleep(retryDelay);
        return this.executeWithRetry<T>(url, config, retriesLeft - 1, retryDelay * 2);
      }

      throw error;
    }
  }

  private async execute<T>(url: string, config: RequestConfig): Promise<HttpResponse<T>> {
    const timeout = config.timeout ?? this.config.timeout;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const signal = config.signal
      ? anySignal([config.signal, controller.signal])
      : controller.signal;

    try {
      const response = await fetch(url, {
        ...config,
        method: config.method ?? "GET",
        headers: {
          "Content-Type": "application/json",
          ...this.config.headers,
          ...config.headers,
        },
        body: config.body != null ? JSON.stringify(config.body) : undefined,
        signal,
      });

      if (!response.ok) {
        throw new HttpError(response.status, response.statusText, response);
      }

      const contentType = response.headers.get("content-type") ?? "";
      const data: T = contentType.includes("application/json")
        ? await response.json()
        : ((await response.text()) as unknown as T);

      let httpResponse: HttpResponse<T> = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        ok: response.ok,
      };

      for (const interceptor of this.responseInterceptors) {
        httpResponse = interceptor(httpResponse) as HttpResponse<T>;
      }

      return httpResponse;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  get<T>(url: string, config?: Omit<RequestConfig, "method" | "body">) {
    return this.request<T>(url, { ...config, method: "GET" });
  }

  post<T>(url: string, body?: unknown, config?: Omit<RequestConfig, "method" | "body">) {
    return this.request<T>(url, { ...config, method: "POST", body });
  }

  put<T>(url: string, body?: unknown, config?: Omit<RequestConfig, "method" | "body">) {
    return this.request<T>(url, { ...config, method: "PUT", body });
  }

  patch<T>(url: string, body?: unknown, config?: Omit<RequestConfig, "method" | "body">) {
    return this.request<T>(url, { ...config, method: "PATCH", body });
  }

  delete<T>(url: string, config?: Omit<RequestConfig, "method" | "body">) {
    return this.request<T>(url, { ...config, method: "DELETE" });
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean>): string {
    const url = path.startsWith("http") ? path : `${this.config.baseUrl}${path}`;
    if (!params || Object.keys(params).length === 0) return url;
    const searchParams = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)]),
    );
    return `${url}?${searchParams.toString()}`;
  }
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      break;
    }
    signal.addEventListener("abort", () => controller.abort(), { once: true });
  }
  return controller.signal;
}
