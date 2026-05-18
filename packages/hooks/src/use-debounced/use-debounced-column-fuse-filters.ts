import { useMemo } from "react";
import { useDebouncedValue } from "./use-debounced-value";
import {
  createFuseSearcher,
  defaultFuseSearchOptions,
  fuseSearchWithIndex,
} from "@/utils/fuse-search";
import type { IFuseOptions } from "fuse.js";
import type { ColumnFuseFilterConfig } from "./types";

/**
 * @function applyColumnFuseFilters
 * @description Apply column fuse filters to a list of items.
 * @template T - The type of the items in the list.
 * @param {readonly T[]} list - The list to filter.
 * @param {ColumnFuseFilterConfig<T>[]} filters - The column fuse filters to apply.
 * @returns {T[]} The filtered list of items.
 */
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

/**
 * @hook useDebouncedColumnFuseFilters
 * @description - Debounce column fuse filters for a specified delay.
 * @param {readonly T[]} list - The list to filter.
 * @param {Record<string, string>} columnSearch - The column search queries.
 * @param {function(string): IFuseOptions<T>["keys"] | undefined} getKeysForColumn - The function to get the keys for a column.
 * @param {number} debounceMs - The delay in milliseconds.
 * @returns {T[]} The debounced result of the column fuse filters.
 */
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
