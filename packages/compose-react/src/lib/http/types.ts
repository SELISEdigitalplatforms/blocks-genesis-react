import type { AuthTokenPair } from "@/models";

export type HeadersInitValue =
  | [string, string][]
  | Record<string, string>
  | Headers;
export type RequestBody =
  | string
  | object
  | Array<unknown>
  | FormData
  | URLSearchParams
  | Blob
  | File
  | null
  | undefined;

export interface HttpClientOptions {
  skipBlocksKey?: boolean;
  withCredentials?: boolean;
  absoluteUrl?: boolean;
  skipTokenRotation?: boolean;
}

export interface RequestOptions extends HttpClientOptions {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: HeadersInitValue;
  body?: RequestBody;
}

export interface RequestQueueItem<T> {
  url: string;
  retry: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
  requestOption?: RequestOptions;
}

export interface HttpClientConfig {
  baseURL: string | (() => string);
  blocksKey: string | (() => string);
  onTokenRefresh?: () => Promise<AuthTokenPair>;
  onUnauthorized?: (error: unknown) => void;
}
