import { useMemo } from "react";
import type { IFuseOptions } from "fuse.js";

import { useDebouncedValue } from "./use-debounced-value";
import { applyColumnFuseFilters } from "./util";
import type { ColumnFuseFilterConfig } from "./types";

/**
 * Debounced multi-column fuzzy filtering helper.
 *
 * @typeParam T Row type.
 * @param list Source rows.
 * @param columnSearch Active search query per column id.
 * @param getKeysForColumn Function returning Fuse keys for a column id.
 * @param debounceMs Debounce duration in milliseconds. Defaults to `250`.
 * @returns Filtered rows.
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
