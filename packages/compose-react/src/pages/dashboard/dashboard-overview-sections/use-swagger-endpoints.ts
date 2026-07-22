import type { ServiceName } from "@/store";
import { getServiceBaseUrl, getServiceSwaggerUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import type {
  HttpMethod,
  ICoreApiEndpoint,
  ISwaggerDocument,
} from "./core-api";
import type { RuntimeKey } from "@/types/runtime.types";
import { getRuntimeEnv } from "@/lib/runtime-env";

interface UseSwaggerEndpointsOptions {
  enabled?: boolean;
  /** swagger docs change rarely — default to a long stale time */
  staleTime?: number;
}

interface UseSwaggerEndpointsResult {
  endpoints: ICoreApiEndpoint[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
}

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

/**
 * Swagger docs don't always carry an absolute server URL for every path, so
 * we try, in order: OpenAPI 3 `servers[0].url`, Swagger 2.0
 * `schemes/host/basePath`, then fall back to the origin of the swagger.json
 * URL itself (e.g. "https://dev-monitor.blocksdevelopers.com:5001").
 */
const resolveBaseUrl = (
  swagger: ISwaggerDocument,
  swaggerUrl: string,
  explicitBaseUrl?: RuntimeKey,
): string => {
  if (explicitBaseUrl) {
    return getRuntimeEnv(explicitBaseUrl).replace(/\/+$/, "");
  }

  if (swagger.servers?.[0]?.url) {
    return swagger.servers[0].url.replace(/\/+$/, "");
  }

  if (swagger.host) {
    const scheme = swagger.schemes?.[0] ?? "https";
    return `${scheme}://${swagger.host}${swagger.basePath ?? ""}`.replace(
      /\/+$/,
      "",
    );
  }

  try {
    return new URL(swaggerUrl).origin;
  } catch {
    return "";
  }
};

/**
 * A lot of real-world Swashbuckle output skips `summary`/`operationId`
 * entirely (see Blocks Monitor's swagger.json — most operations have
 * neither). Falling back to the raw path as the title is ugly since the
 * path is already shown underneath, so we turn "GetUsers" into "Get Users"
 * etc. as a last resort.
 */
const humanizeFromPath = (path: string): string => {
  const segments = path.split("/").filter(Boolean);
  let last = segments[segments.length - 1] ?? path;
  if (last.startsWith("{") && segments.length > 1) {
    last = segments[segments.length - 2] ?? path;
  }
  return last
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_.]/g, " ")
    .trim();
};

const parseSwaggerDocument = (
  swagger: ISwaggerDocument,
  swaggerUrl: string,
  explicitBaseUrl?: RuntimeKey,
): ICoreApiEndpoint[] => {
  const baseUrl = resolveBaseUrl(swagger, swaggerUrl, explicitBaseUrl);
  const endpoints: ICoreApiEndpoint[] = [];

  Object.entries(swagger.paths ?? {}).forEach(([path, operations]) => {
    METHODS.forEach((method) => {
      const key = method.toLowerCase() as Lowercase<HttpMethod>;
      const operation = operations?.[key];
      if (!operation) return;

      endpoints.push({
        itemId: `${method}:${path}`,
        method,
        summary:
          operation.summary ||
          operation.operationId ||
          operation.description ||
          humanizeFromPath(path),
        path: `${baseUrl}${path}`,
        tag: operation.tags?.[0],
      });
    });
  });

  return endpoints;
};

const fetchSwaggerDocument = async (
  swaggerUrl: string,
): Promise<ISwaggerDocument> => {
  const response = await fetch(swaggerUrl);
  if (!response.ok) {
    throw new Error(`Failed to load swagger document (${response.status})`);
  }
  return response.json();
};

/**
 * Fetches a service's swagger.json (URL resolved from runtime config via
 * `serviceName`) and turns it into the flat ICoreApiEndpoint[] shape
 * CoreApiCard expects. This is the one place that needs to know anything
 * about raw OpenAPI/Swagger shape or runtime config keys.
 *
 * Swap the fetcher for your HttpClient wrapper if the swagger endpoint ever
 * needs auth headers; plain fetch assumes it's publicly readable, which is
 * the Swashbuckle default.
 */
export const useSwaggerEndpoints = (
  serviceName: ServiceName | undefined,

  {
    enabled = true,
    staleTime = 5 * 60 * 1000,
  }: UseSwaggerEndpointsOptions = {},
): UseSwaggerEndpointsResult => {
  const baseUrl = serviceName ? getServiceBaseUrl(serviceName) : undefined;
  const swaggerUrl = serviceName
    ? getServiceSwaggerUrl(serviceName)
    : undefined;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["swagger-endpoints", swaggerUrl],
    queryFn: () => fetchSwaggerDocument(swaggerUrl as string),
    enabled: Boolean(swaggerUrl) && enabled,
    staleTime,
  });

  const endpoints =
    data && swaggerUrl ? parseSwaggerDocument(data, swaggerUrl, baseUrl) : [];

  return { endpoints, isLoading, isError, error };
};
