import type {
  HttpMethod,
  ICoreApiEndpoint,
  ISwaggerDocument,
} from "./core-api-endpoint.model";

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
): string => {
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

export const parseSwaggerDocument = (
  swagger: ISwaggerDocument,
  swaggerUrl: string,
): ICoreApiEndpoint[] => {
  const baseUrl = resolveBaseUrl(swagger, swaggerUrl);
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
          path,
        path: `${baseUrl}${path}`,
        tag: operation.tags?.[0],
      });
    });
  });

  return endpoints;
};
