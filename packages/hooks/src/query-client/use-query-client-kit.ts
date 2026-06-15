import {
  type DefaultError,
  type QueryFunction,
  type SetDataOptions,
  type Updater,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  BlocksQueryKey,
  QueryClientKitFetchOptions,
  QueryClientKitFilters,
  UseQueryClientKitReturn,
} from "./types";

const withQueryKey = <TFilters extends QueryClientKitFilters | undefined>(
  queryKey: BlocksQueryKey,
  filters: TFilters,
) => ({
  ...filters,
  queryKey,
});

/**
 * Provides factory-first helpers around TanStack Query's `QueryClient`.
 *
 * The helper methods require keys produced by `createQueryKeyFactory`, keeping
 * cache reads, writes, and invalidations consistent across applications. The
 * raw TanStack client is still returned as `client` for advanced cases that are
 * intentionally outside the blocks-kit abstraction.
 *
 * @returns Typed cache helpers and the raw TanStack Query client.
 */
export function useQueryClientKit(): UseQueryClientKitReturn {
  const client = useQueryClient();

  return {
    client,
    invalidate: (key, filters, options) =>
      client.invalidateQueries(withQueryKey(key, filters), options),
    invalidateMany: async (keys, filters, options) => {
      await Promise.all(
        keys.map((key) => client.invalidateQueries(withQueryKey(key, filters), options)),
      );
    },
    cancel: (key, filters, options) => client.cancelQueries(withQueryKey(key, filters), options),
    refetch: (key, filters, options) => client.refetchQueries(withQueryKey(key, filters), options),
    remove: (key, filters) => client.removeQueries(withQueryKey(key, filters)),
    reset: (key, filters, options) => client.resetQueries(withQueryKey(key, filters), options),
    getData: <TData = unknown>(key: BlocksQueryKey) => client.getQueryData<TData>(key),
    setData: <TData = unknown>(
      key: BlocksQueryKey,
      updater: Updater<TData | undefined, TData | undefined>,
      options?: SetDataOptions,
    ): TData | undefined => client.setQueryData<TData>(key, updater, options) as TData | undefined,
    getQueriesData: (key, filters) => client.getQueriesData(withQueryKey(key, filters)),
    setQueriesData: (key, updater, filters) =>
      client.setQueriesData(withQueryKey(key, filters), updater),
    fetch: <
      TQueryFnData = unknown,
      TError = DefaultError,
      TData = TQueryFnData,
      TKey extends BlocksQueryKey = BlocksQueryKey,
    >(
      key: TKey,
      queryFn: QueryFunction<TQueryFnData, TKey>,
      options?: QueryClientKitFetchOptions<TQueryFnData, TError, TData, TKey>,
    ) =>
      client.fetchQuery({
        ...options,
        queryKey: key,
        queryFn,
      }),
    ensure: <
      TQueryFnData = unknown,
      TError = DefaultError,
      TData = TQueryFnData,
      TKey extends BlocksQueryKey = BlocksQueryKey,
    >(
      key: TKey,
      queryFn: QueryFunction<TQueryFnData, TKey>,
      options?: QueryClientKitFetchOptions<TQueryFnData, TError, TData, TKey>,
    ) =>
      client.ensureQueryData({
        ...options,
        queryKey: key,
        queryFn,
      }),
  };
}
