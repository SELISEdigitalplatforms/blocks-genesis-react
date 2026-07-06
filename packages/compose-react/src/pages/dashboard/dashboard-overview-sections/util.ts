import { getRuntimeEnv } from "@/lib/runtime-env";
import type {
  HttpMethod,
  ICoreApiEndpoint,
  ISwaggerDocument,
} from "./core-api";
import type { RuntimeKey } from "@/layouts";

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

export const parseSwaggerDocument = (
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

const METHODS_WITH_BODY: HttpMethod[] = ["POST", "PUT", "PATCH"];

/**
 * Builds a copy-pasteable curl command for an endpoint, with the
 * X-Blocks-Key header pre-filled. Most Blocks endpoints are POST with a
 * JSON body, so we add Content-Type + an empty body placeholder for those
 * methods — otherwise the curl is a near-useless template.
 */
export const buildCurlCommand = (
  endpoint: ICoreApiEndpoint,
  xBlocksKey?: string,
): string => {
  const method = endpoint.method ?? "GET";
  const headerValue = xBlocksKey || getRuntimeEnv("BLOCKS_X_BLOCKS_KEY");

  const lines = [
    `curl -X ${method} '${endpoint.path}'`,
    `  -H 'X-Blocks-Key: ${headerValue}'`,
  ];

  if (METHODS_WITH_BODY.includes(method)) {
    lines.push(`  -H 'Content-Type: application/json'`);
    lines.push(`  -d '{}'`);
  }

  return lines.join(" \\\n");
};

export interface ICoreApiGroup {
  tag: string;
  endpoints: ICoreApiEndpoint[];
}

/**
 * Groups endpoints by their swagger tag (the controller name — "Iam",
 * "Mfa", "Captcha", "ApiEndpointConfig", etc.). Order follows first
 * appearance in the swagger doc rather than alphabetical, since that
 * already tends to match controller declaration order.
 */
export const groupEndpointsByTag = (
  endpoints: ICoreApiEndpoint[],
): ICoreApiGroup[] => {
  const order: string[] = [];
  const byTag = new Map<string, ICoreApiEndpoint[]>();

  endpoints.forEach((endpoint) => {
    const tag = endpoint.tag || "Other";
    if (!byTag.has(tag)) {
      byTag.set(tag, []);
      order.push(tag);
    }
    byTag.get(tag)?.push(endpoint);
  });

  return order.map((tag) => ({ tag, endpoints: byTag.get(tag) ?? [] }));
};
