/**
 * Clears the query string of the current URL.
 *
 * @param options Optional configuration object.
 * @param options.except Optional array of keys to keep in the query string.
 * @example
 * ```ts
 * clearQueryString({ except: ["page"] }); // Clears all query parameters except "page"
 * ```
 */
export const clearQueryString = (options?: { except?: string[] }) => {
  const url = new URL(window.location.href);
  const newParams = new URLSearchParams();

  const keysToKeep = options?.except ?? [];

  keysToKeep.forEach((key) => {
    const value = url.searchParams.get(key);
    if (value !== null) {
      newParams.set(key, value);
    }
  });

  url.search = newParams.toString();
  window.history.replaceState(null, "", url.toString());
};

/**
 * Resets the query string of the current URL to an empty string.
 */
export const resetQueryString = () => {
  clearQueryString();
};
