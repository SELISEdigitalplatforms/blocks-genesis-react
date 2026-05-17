export function parseQueryString(query: string): Record<string, string> {
  const searchParams = new URLSearchParams(query.startsWith("?") ? query.slice(1) : query);
  return Object.fromEntries(searchParams.entries());
}

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
