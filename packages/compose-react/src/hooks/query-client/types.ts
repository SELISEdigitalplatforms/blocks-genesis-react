import type {
  CancelOptions,
  DefaultError,
  FetchQueryOptions,
  InvalidateOptions,
  InvalidateQueryFilters,
  QueryClient,
  QueryFilters,
  QueryFunction,
  QueryKey,
  RefetchOptions,
  RefetchQueryFilters,
  ResetOptions,
  SetDataOptions,
  Updater,
} from "@tanstack/react-query";

declare const blocksQueryKeyBrand: unique symbol;

/**
 * Primitive values that can safely be used as query-key segments.
 */
export type QueryKeyPrimitive = string | number | boolean | null | undefined;

/**
 * Object value accepted as a query-key segment.
 *
 * TanStack Query hashes object segments structurally, so plain readonly records
 * are supported for filter and pagination payloads.
 */
export type QueryKeyRecord = {
  readonly [key: string]: QueryKeyPart;
};

/**
 * Value accepted by the blocks-kit query-key factory.
 */
export type QueryKeyPart =
  | QueryKeyPrimitive
  | QueryKeyRecord
  | readonly QueryKeyPart[];

/**
 * Query key produced by `createQueryKeyFactory`.
 *
 * The brand is intentionally structural-only at compile time. It nudges cache
 * helpers toward factory-created keys while keeping the runtime value a normal
 * TanStack Query key.
 *
 * @typeParam TParts Literal tuple type of the produced query key.
 */
export type BlocksQueryKey<
  TParts extends readonly QueryKeyPart[] = readonly QueryKeyPart[],
> = TParts & {
  readonly [blocksQueryKeyBrand]: true;
};

/**
 * Function used inside query-key factories to create branded keys.
 *
 * @typeParam TPrefix Prefix prepended by the factory, usually the namespace.
 */
export type QueryKeyBuilder<
  TPrefix extends readonly QueryKeyPart[] = readonly QueryKeyPart[],
> = <const TParts extends readonly QueryKeyPart[]>(
  ...parts: TParts
) => BlocksQueryKey<readonly [...TPrefix, ...TParts]>;

/**
 * Shape returned by `createQueryKeyFactory`.
 *
 * @typeParam TNamespace Namespace segment prepended to every key.
 * @typeParam TDefinitions User-defined key builder map.
 */
export type QueryKeyFactory<
  TNamespace extends string,
  TDefinitions extends Record<string, (...args: never[]) => BlocksQueryKey>,
> = TDefinitions & {
  /** Returns the namespace-level key for broad cache operations. */
  all: () => BlocksQueryKey<readonly [TNamespace]>;
  /** Creates an ad-hoc factory-branded key under the namespace. */
  key: <const TParts extends readonly QueryKeyPart[]>(
    ...parts: TParts
  ) => BlocksQueryKey<readonly [TNamespace, ...TParts]>;
};

/**
 * Query filters accepted by helpers that operate on one branded query key.
 *
 * The `queryKey` field is omitted because blocks-kit receives it as the first
 * argument and applies it for the consumer.
 */
export type QueryClientKitFilters<
  TFilters extends QueryFilters = QueryFilters,
> = Omit<TFilters, "queryKey">;

/**
 * Invalidation filters accepted by `invalidate` and `invalidateMany`.
 */
export type QueryClientKitInvalidateFilters =
  QueryClientKitFilters<InvalidateQueryFilters>;

/**
 * Refetch filters accepted by `refetch`.
 */
export type QueryClientKitRefetchFilters =
  QueryClientKitFilters<RefetchQueryFilters>;

/**
 * Options accepted by `fetch` and `ensure`.
 *
 * `queryKey` and `queryFn` are supplied as positional arguments so consumers do
 * not accidentally mix a raw query key with a factory-created key.
 */
export type QueryClientKitFetchOptions<
  TQueryFnData,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = Omit<
  FetchQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  "queryKey" | "queryFn"
>;

/**
 * Return shape of `useQueryClientKit`.
 */
export type UseQueryClientKitReturn = {
  /** Raw TanStack Query client for deliberate advanced escape-hatch usage. */
  client: QueryClient;
  /**
   * Invalidates queries matching a factory-created key.
   *
   * Uses TanStack's prefix matching unless `filters.exact` is set to `true`.
   */
  invalidate: (
    key: BlocksQueryKey,
    filters?: QueryClientKitInvalidateFilters,
    options?: InvalidateOptions,
  ) => Promise<void>;
  /**
   * Invalidates several factory-created keys in sequence.
   *
   * Useful after mutations that touch multiple cache domains.
   */
  invalidateMany: (
    keys: readonly BlocksQueryKey[],
    filters?: QueryClientKitInvalidateFilters,
    options?: InvalidateOptions,
  ) => Promise<void>;
  /** Cancels in-flight queries matching a factory-created key. */
  cancel: (
    key: BlocksQueryKey,
    filters?: QueryClientKitFilters,
    options?: CancelOptions,
  ) => Promise<void>;
  /** Refetches queries matching a factory-created key. */
  refetch: (
    key: BlocksQueryKey,
    filters?: QueryClientKitRefetchFilters,
    options?: RefetchOptions,
  ) => Promise<void>;
  /** Removes queries matching a factory-created key from the cache. */
  remove: (key: BlocksQueryKey, filters?: QueryClientKitFilters) => void;
  /** Resets queries matching a factory-created key back to their initial state. */
  reset: (
    key: BlocksQueryKey,
    filters?: QueryClientKitFilters,
    options?: ResetOptions,
  ) => Promise<void>;
  /** Reads cached data for an exact factory-created key. */
  getData: <TData = unknown>(key: BlocksQueryKey) => TData | undefined;
  /** Writes cached data for an exact factory-created key. */
  setData: <TData = unknown>(
    key: BlocksQueryKey,
    updater: Updater<TData | undefined, TData | undefined>,
    options?: SetDataOptions,
  ) => TData | undefined;
  /** Reads cached data for every query matching a factory-created key. */
  getQueriesData: <TData = unknown>(
    key: BlocksQueryKey,
    filters?: QueryClientKitFilters,
  ) => Array<[QueryKey, TData | undefined]>;
  /** Writes cached data for every query matching a factory-created key. */
  setQueriesData: <TData = unknown>(
    key: BlocksQueryKey,
    updater: Updater<TData | undefined, TData | undefined>,
    filters?: QueryClientKitFilters,
  ) => Array<[QueryKey, TData | undefined]>;
  /** Fetches and caches data for a factory-created key. */
  fetch: <
    TQueryFnData = unknown,
    TError = DefaultError,
    TData = TQueryFnData,
    TKey extends BlocksQueryKey = BlocksQueryKey,
  >(
    key: TKey,
    queryFn: QueryFunction<TQueryFnData, TKey>,
    options?: QueryClientKitFetchOptions<TQueryFnData, TError, TData, TKey>,
  ) => Promise<TData>;
  /** Ensures data exists for a factory-created key, fetching it when absent. */
  ensure: <
    TQueryFnData = unknown,
    TError = DefaultError,
    TData = TQueryFnData,
    TKey extends BlocksQueryKey = BlocksQueryKey,
  >(
    key: TKey,
    queryFn: QueryFunction<TQueryFnData, TKey>,
    options?: QueryClientKitFetchOptions<TQueryFnData, TError, TData, TKey>,
  ) => Promise<TData>;
};
