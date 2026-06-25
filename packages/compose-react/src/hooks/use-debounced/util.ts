import {
  createFuseSearcher,
  defaultFuseSearchOptions,
  fuseSearchWithIndex,
} from "../utils/fuse-search";
import type { ColumnFuseFilterConfig } from "./types";

/**
 * Applies multiple column-specific fuzzy filters sequentially.
 *
 * @typeParam T Row type.
 * @param list Source rows.
 * @param filters Column filter configuration list.
 * @returns Filtered rows after all column filters are applied.
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
