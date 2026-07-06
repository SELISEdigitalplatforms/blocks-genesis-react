export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ICoreApiEndpoint {
  itemId: string;
  method?: HttpMethod;
  summary: string;
  path: string;
  /** swagger `tags[0]` — not used for grouping yet, kept for later */
  tag?: string;
}

/**
 * Minimal shape we rely on from an OpenAPI/Swagger document. Kept permissive
 * (lots of optional fields) since Swashbuckle/NSwag output varies slightly
 * between services and we only need a handful of fields to render a row.
 */
export interface ISwaggerOperation {
  summary?: string;
  description?: string;
  operationId?: string;
  tags?: string[];
}

export interface ISwaggerDocument {
  /** OpenAPI 3.x */
  servers?: { url: string }[];
  /** Swagger 2.0 */
  host?: string;
  basePath?: string;
  schemes?: string[];
  paths: Record<
    string,
    Partial<Record<Lowercase<HttpMethod>, ISwaggerOperation>>
  >;
}
