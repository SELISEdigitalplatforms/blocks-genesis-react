import type { QueryParams, QueryParamValue } from "./types";

/**
 * Combines multiple abort signals into a single signal.
 *
 * The returned signal aborts when any input signal aborts.
 *
 * @param signals Source abort signals.
 * @returns Combined abort signal.
 */
export function anySignal(signals: AbortSignal[]): AbortSignal {
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

/**
 * Joins a base URL and a path without duplicating or dropping slashes.
 *
 * @param baseUrl Base URL prefix.
 * @param path Relative or absolute path segment.
 * @returns Normalized joined URL.
 */
export function joinUrl(baseUrl: string, path: string): string {
  if (!baseUrl) return path;
  if (!path) return baseUrl;

  const baseEndsWithSlash = baseUrl.endsWith("/");
  const pathStartsWithSlash = path.startsWith("/");

  if (baseEndsWithSlash && pathStartsWithSlash) return `${baseUrl}${path.slice(1)}`;
  if (!baseEndsWithSlash && !pathStartsWithSlash) return `${baseUrl}/${path}`;
  return `${baseUrl}${path}`;
}

/**
 * Appends query parameters to a URL.
 *
 * `null` and `undefined` values are omitted.
 * Array values are appended as repeated query keys.
 *
 * @param url Target URL.
 * @param params Query parameter map.
 * @returns URL with serialized query string.
 */
export function appendQueryParams(url: string, params?: QueryParams): string {
  if (!params || Object.keys(params).length === 0) return url;

  const searchParams = new URLSearchParams();

  const addValue = (key: string, value: QueryParamValue) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null) {
          searchParams.append(key, String(item));
        }
      });
      return;
    }

    searchParams.append(key, String(value));
  };

  Object.entries(params).forEach(([key, value]) => addValue(key, value));

  const queryString = searchParams.toString();
  if (!queryString) return url;
  return `${url}${url.includes("?") ? "&" : "?"}${queryString}`;
}
