import type { BlocksQueryKey, QueryKeyBuilder, QueryKeyFactory, QueryKeyPart } from "./types";

const brandQueryKey = <const TParts extends readonly QueryKeyPart[]>(
  parts: TParts,
): BlocksQueryKey<TParts> => parts as BlocksQueryKey<TParts>;

/**
 * Creates a namespace-scoped query-key factory.
 *
 * Every key created by the returned factory starts with `namespace`, which makes
 * broad cache operations such as invalidating an entire domain predictable.
 *
 * @typeParam TNamespace Namespace segment prepended to every key.
 * @typeParam TDefinitions User-defined key builder map.
 * @param namespace Stable namespace for this cache domain.
 * @param define Receives a key builder and returns domain-specific key helpers.
 * @returns Namespace helpers plus the user-defined key helpers.
 *
 * @example
 * ```ts
 * export const userKeys = createQueryKeyFactory("user", (key) => ({
 *   current: () => key("current"),
 *   detail: (id: string) => key("detail", id),
 *   list: (filters: UserFilters) => key("list", filters),
 * }));
 * ```
 */
export function createQueryKeyFactory<
  const TNamespace extends string,
  const TDefinitions extends Record<string, (...args: never[]) => BlocksQueryKey>,
>(
  namespace: TNamespace,
  define: (key: QueryKeyBuilder<readonly [TNamespace]>) => TDefinitions,
): QueryKeyFactory<TNamespace, TDefinitions> {
  const namespacedKey = <const TParts extends readonly QueryKeyPart[]>(
    ...parts: TParts
  ): BlocksQueryKey<readonly [TNamespace, ...TParts]> => brandQueryKey([namespace, ...parts]);

  const key: QueryKeyBuilder<readonly [TNamespace]> = (...parts) => namespacedKey(...parts);
  const definitions = define(key);

  return {
    ...definitions,
    all: () => namespacedKey(),
    key: namespacedKey,
  };
}
