import {
  createFuseSearcher,
  defaultFuseSearchOptions,
  fuseSearchWithIndex,
} from "@/utils/fuse-search";
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
