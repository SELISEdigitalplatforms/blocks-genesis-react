import { getRuntimeEnv } from "@/lib/runtime-env";
import type { HttpMethod, ICoreApiEndpoint } from "./core-api-endpoint.model";

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
