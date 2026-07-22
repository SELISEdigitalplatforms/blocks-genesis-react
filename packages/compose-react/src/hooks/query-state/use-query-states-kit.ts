import { useMemo } from "react";
import {
  type Options as NuqsOptions,
  type SetValues,
  type UseQueryStatesKeysMap,
  type UseQueryStatesOptions,
  type Values,
  useQueryStates,
} from "nuqs";

/**
 * Schema map passed to `useQueryStatesKit`.
 *
 * This type maps query keys to `nuqs` parser builders (for example,
 * `parseAsString.withDefault("")`).
 */
export type QueryStatesKitSchema = UseQueryStatesKeysMap;

/**
 * Navigation options accepted by query update helpers.
 *
 * These options are forwarded to `nuqs` state updaters.
 */
export type QueryUpdateOptions = NuqsOptions;

/**
 * Typed partial update payload for a query-state schema.
 *
 * Each key can be set to a parsed value or `null` to clear it from the URL.
 */
export type QueryPatch<TSchema extends QueryStatesKitSchema> = Partial<{
  [Key in keyof Values<TSchema>]: Values<TSchema>[Key] | null;
}>;

/**
 * Updater callback shape used by `setQuery` and `updateAndResetPage`.
 */
export type QueryPatchUpdater<TSchema extends QueryStatesKitSchema> = (
  previous: Values<TSchema>,
) => QueryPatch<TSchema> | null;

type QueryKey<TSchema extends QueryStatesKitSchema> = Extract<
  keyof Values<TSchema>,
  string
>;

/**
 * Behavior defaults for URL updates performed by `useQueryStatesKit`.
 */
export type QueryStatesKitBehavior = {
  /** History mode used when no override is provided. */
  history?: "replace" | "push";
  /** Whether updates should be shallow by default. */
  shallow?: boolean;
  /** Whether updates should trigger scroll by default. */
  scroll?: boolean;
  /** Conventional pagination key for page helpers. */
  pageKey?: string;
};

/**
 * Options accepted by `useQueryStatesKit`.
 *
 * @typeParam TSchema Query-state schema map based on `nuqs` parsers.
 */
export type QueryStatesKitOptions<TSchema extends QueryStatesKitSchema> = {
  /** Parser map used by `nuqs/useQueryStates`. */
  schema: TSchema;
  /** Default values used by reset helpers. */
  defaults: Partial<Values<TSchema>>;
  /** Optional behavior defaults for URL update operations. */
  behavior?: QueryStatesKitBehavior;
  /** Optional extra options forwarded to `useQueryStates` declaration-time config. */
  hookOptions?: Partial<UseQueryStatesOptions<TSchema>>;
};

/**
 * Return shape of `useQueryStatesKit`.
 */
export type UseQueryStatesKitReturn<TSchema extends QueryStatesKitSchema> = {
  /** Parsed query-state values from `nuqs`. */
  query: Values<TSchema>;
  /** Partial query updater preserving untouched keys. */
  setQuery: (
    patch: QueryPatch<TSchema> | QueryPatchUpdater<TSchema>,
    options?: QueryUpdateOptions,
  ) => Promise<URLSearchParams>;
  /** Reset all keys or selected keys to configured defaults. */
  resetQuery: (
    keys?: ReadonlyArray<Extract<keyof Values<TSchema>, string>>,
    options?: QueryUpdateOptions,
  ) => Promise<URLSearchParams>;
  /** Clear all keys or selected keys from the URL by setting them to `null`. */
  clearQuery: (
    keys?: ReadonlyArray<Extract<keyof Values<TSchema>, string>>,
    options?: QueryUpdateOptions,
  ) => Promise<URLSearchParams>;
  /** Set a page-like key to a specific value. */
  setPage: (
    value: Values<TSchema>[QueryKey<TSchema>] | null,
    pageKey?: QueryKey<TSchema>,
    options?: QueryUpdateOptions,
  ) => Promise<URLSearchParams>;
  /** Reset a page-like key to defaults (or clear if no default exists). */
  resetPage: (
    pageKey?: QueryKey<TSchema>,
    options?: QueryUpdateOptions,
  ) => Promise<URLSearchParams>;
  /** Apply a partial update and reset page key in a single URL update. */
  updateAndResetPage: (
    patch: QueryPatch<TSchema> | QueryPatchUpdater<TSchema>,
    pageKey?: QueryKey<TSchema>,
    options?: QueryUpdateOptions,
  ) => Promise<URLSearchParams>;
  /** Raw `nuqs` setter for advanced usage. */
  setRawQuery: SetValues<TSchema>;
};

/**
 * Opinionated wrapper around `nuqs/useQueryStates` for filter/sort/pagination flows.
 *
 * Defaults:
 * - `history`: `"replace"`
 * - `shallow`: `true`
 * - `scroll`: `false`
 * - `pageKey`: `"page"`
 *
 * Integration note:
 * - Next.js: configure the nuqs Next adapter/provider per nuqs documentation.
 * - React Router: wrap your app with `NuqsAdapter` from `nuqs/adapters/react-router/v6`.
 *
 * @typeParam TSchema Query-state schema map based on `nuqs` parser builders.
 * @param options Hook configuration (`schema`, `defaults`, and optional behavior).
 * @returns Typed query state and helper actions.
 */
export function useQueryStatesKit<TSchema extends QueryStatesKitSchema>(
  options: QueryStatesKitOptions<TSchema>,
): UseQueryStatesKitReturn<TSchema> {
  const { schema, defaults, behavior, hookOptions } = options;

  const resolvedBehavior = useMemo(
    () => ({
      history: behavior?.history ?? "replace",
      shallow: behavior?.shallow ?? true,
      scroll: behavior?.scroll ?? false,
      pageKey: behavior?.pageKey ?? "page",
    }),
    [behavior?.history, behavior?.pageKey, behavior?.scroll, behavior?.shallow],
  );

  const [query, setRawQuery] = useQueryStates(schema, {
    history: resolvedBehavior.history,
    shallow: resolvedBehavior.shallow,
    scroll: resolvedBehavior.scroll,
    ...hookOptions,
  });

  const resolveOptions = (
    override?: QueryUpdateOptions,
  ): QueryUpdateOptions => ({
    history: resolvedBehavior.history,
    shallow: resolvedBehavior.shallow,
    scroll: resolvedBehavior.scroll,
    ...override,
  });

  const setQuery: UseQueryStatesKitReturn<TSchema>["setQuery"] = (
    patch,
    updateOptions,
  ) => {
    if (typeof patch === "function") {
      return setRawQuery(
        (previous) => patch(previous),
        resolveOptions(updateOptions),
      );
    }

    return setRawQuery(patch, resolveOptions(updateOptions));
  };

  const resetQuery: UseQueryStatesKitReturn<TSchema>["resetQuery"] = (
    keys,
    updateOptions,
  ) => {
    const targetKeys =
      keys ?? (Object.keys(schema) as Array<QueryKey<TSchema>>);

    const resetPatch: Record<string, unknown> = {};
    for (const key of targetKeys) {
      resetPatch[key] =
        key in defaults ? defaults[key as keyof Values<TSchema>] : null;
    }

    return setRawQuery(
      resetPatch as QueryPatch<TSchema>,
      resolveOptions(updateOptions),
    );
  };

  const clearQuery: UseQueryStatesKitReturn<TSchema>["clearQuery"] = (
    keys,
    updateOptions,
  ) => {
    if (!keys) {
      return setRawQuery(null, resolveOptions(updateOptions));
    }

    const clearPatch: Record<string, null> = {};
    for (const key of keys) {
      clearPatch[key] = null;
    }

    return setRawQuery(
      clearPatch as QueryPatch<TSchema>,
      resolveOptions(updateOptions),
    );
  };

  const setPage: UseQueryStatesKitReturn<TSchema>["setPage"] = (
    value,
    pageKey,
    updateOptions,
  ) => {
    const key = (pageKey ?? resolvedBehavior.pageKey) as QueryKey<TSchema>;

    return setRawQuery(
      {
        [key]: value,
      } as QueryPatch<TSchema>,
      resolveOptions(updateOptions),
    );
  };

  const resetPage: UseQueryStatesKitReturn<TSchema>["resetPage"] = (
    pageKey,
    updateOptions,
  ) => {
    const key = (pageKey ?? resolvedBehavior.pageKey) as QueryKey<TSchema>;
    const nextValue =
      key in defaults ? defaults[key as keyof Values<TSchema>] : null;

    return setRawQuery(
      {
        [key]: nextValue,
      } as QueryPatch<TSchema>,
      resolveOptions(updateOptions),
    );
  };

  const updateAndResetPage: UseQueryStatesKitReturn<TSchema>["updateAndResetPage"] =
    (patch, pageKey, updateOptions) => {
      const key = (pageKey ?? resolvedBehavior.pageKey) as QueryKey<TSchema>;
      const nextPage =
        key in defaults ? defaults[key as keyof Values<TSchema>] : null;

      return setRawQuery((previous) => {
        const partialPatch =
          typeof patch === "function" ? patch(previous) : patch;
        if (!partialPatch) {
          return {
            [key]: nextPage,
          } as QueryPatch<TSchema>;
        }

        return {
          ...partialPatch,
          [key]: nextPage,
        };
      }, resolveOptions(updateOptions));
    };

  return {
    query,
    setQuery,
    resetQuery,
    clearQuery,
    setPage,
    resetPage,
    updateAndResetPage,
    setRawQuery,
  };
}
