/**
 * Parses a query string into a plain object.
 *
 * @param query Query string with or without leading `?`.
 * @returns Key-value map of query parameters.
 */
export function parseQueryString(query: string): Record<string, string> {
  const searchParams = new URLSearchParams(
    query.startsWith("?") ? query.slice(1) : query,
  );
  return Object.fromEntries(searchParams.entries());
}

/**
 * Serializes a query object into a URL query string.
 *
 * `undefined` values are omitted.
 *
 * @param params Query map values.
 * @returns Query string prefixed with `?`, or empty string.
 */
export function stringifyQueryString(
  params: Record<string, string | number | boolean | undefined>,
): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  });
  const str = searchParams.toString();
  return str ? `?${str}` : "";
}
