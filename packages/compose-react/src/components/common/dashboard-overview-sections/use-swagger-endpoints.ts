import { useQuery } from "@tanstack/react-query";
import { parseSwaggerDocument } from "./util";
import type {
  ICoreApiEndpoint,
  ISwaggerDocument,
} from "./core-api-endpoint.model";

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
 * Fetches a service's swagger.json and turns it into the flat
 * ICoreApiEndpoint[] shape CoreApiCard expects. This is the one place that
 * needs to know anything about raw OpenAPI/Swagger shape — CoreApiCard never
 * has to.
 *
 * Swap the fetcher for your HttpClient wrapper if the swagger endpoint ever
 * needs auth headers; plain fetch assumes it's publicly readable, which is
 * the Swashbuckle default.
 */
export const useSwaggerEndpoints = (
  swaggerUrl: string | undefined,
  {
    enabled = true,
    staleTime = 5 * 60 * 1000,
  }: UseSwaggerEndpointsOptions = {},
): UseSwaggerEndpointsResult => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["swagger-endpoints", swaggerUrl],
    queryFn: () => fetchSwaggerDocument(swaggerUrl as string),
    enabled: Boolean(swaggerUrl) && enabled,
    staleTime,
  });

  const endpoints =
    data && swaggerUrl ? parseSwaggerDocument(data, swaggerUrl) : [];

  return { endpoints, isLoading, isError, error };
};
