import type { RuntimeKey } from "@/layouts";
import { getRuntimeEnv } from "@/lib";
import type { ServiceName } from "@/store";

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

export const SERVICE_BASE_URL_KEY: Record<ServiceName, RuntimeKey> = {
  "blocks-os": "BLOCKS_OS_BASE_URL",
  "blocks-utilities": "BLOCKS_UTILITIES_BASE_URL",
  "blocks-logic": "BLOCKS_LOGIC_BASE_URL",
  "blocks-monitor": "BLOCKS_MONITOR_BASE_URL",
  "blocks-release": "BLOCKS_RELEASE_BASE_URL",
  "blocks-iam": "BLOCKS_IAM_BASE_URL",
  "blocks-studio": "BLOCKS_STUDIO_BASE_URL",
  "blocks-agents": "BLOCKS_AGENTS_BASE_URL",
  "blocks-data": "BLOCKS_DATA_BASE_URL",
  "blocks-localization": "BLOCKS_LOCALIZATION_BASE_URL",
};

/**
 * Resolves a service's base URL out of whatever runtime-config object you
 * already have in hand (e.g. `useBlocksAppConfigStore((s) => s.config)`).
 * Returns undefined rather than throwing if the key isn't populated yet —
 * config can legitimately still be loading.
 */
export const getServiceBaseUrl = (
  serviceName: ServiceName,
): string | undefined => SERVICE_BASE_URL_KEY[serviceName];

/**
 * Same, but appended with the standard Swashbuckle swagger.json path —
 * confirmed consistent across services regardless of whether they're on a
 * custom port (dev-monitor:5001) or not (dev-release).
 */
export const getServiceSwaggerUrl = (
  serviceName: ServiceName,
): string | undefined => {
  const baseUrl = getServiceBaseUrl(serviceName);
  if (!baseUrl) return undefined;
  const runTimeBaseUrl = getRuntimeEnv(baseUrl);
  return `${runTimeBaseUrl.replace(/\/+$/, "")}/swagger/v1/swagger.json`;
};
