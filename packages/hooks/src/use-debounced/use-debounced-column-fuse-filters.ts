import { useMemo } from "react";
import type { IFuseOptions } from "fuse.js";

import { useDebouncedValue } from "./use-debounced-value";
import {
  createFuseSearcher,
  defaultFuseSearchOptions,
  fuseSearchWithIndex,
} from "../utils/fuse-search";

export type ColumnFuseFilterConfig<T> = {
  columnId: string;
  query: string;
  keys: NonNullable<IFuseOptions<T>["keys"]>;
};

export const applyColumnFuseFilters = <T>(
  list: readonly T[],
  filters: ColumnFuseFilterConfig<T>[],
): T[] =>
  filters.reduce<T[]>(
    (rows, filter) => {
      const trimmed = filter.query.trim();
      if (!trimmed || !filter.keys?.length) {
        return rows;
      }
      const options = { ...defaultFuseSearchOptions<T>(), keys: filter.keys };
      const fuse = createFuseSearcher(rows, options);
      return fuseSearchWithIndex(fuse, rows, trimmed);
    },
    [...list],
  );

export const useDebouncedColumnFuseFilters = <T>(
  list: readonly T[],
  columnSearch: Record<string, string>,
  getKeysForColumn: (columnId: string) => IFuseOptions<T>["keys"] | undefined,
  debounceMs = 250,
): T[] => {
  const debouncedSearch = useDebouncedValue(columnSearch, debounceMs);

  return useMemo(() => {
    const configs: ColumnFuseFilterConfig<T>[] = [];

    for (const [columnId, query] of Object.entries(debouncedSearch)) {
      const keys = getKeysForColumn(columnId);
      if (!keys?.length) {
        continue;
      }
      configs.push({ columnId, query, keys });
    }

    return applyColumnFuseFilters(list, configs);
  }, [list, debouncedSearch, getKeysForColumn]);
};
