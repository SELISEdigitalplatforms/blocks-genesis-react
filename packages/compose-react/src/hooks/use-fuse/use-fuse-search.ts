import { useMemo } from "react";
import type { IFuseOptions } from "fuse.js";

import { fuseFilter } from "../utils/fuse-search";

/**
 * Memoized fuzzy search over a list.
 *
 * @typeParam T Row type.
 * @param list Source rows.
 * @param query Search query.
 * @param options Fuse.js options.
 * @returns Filtered rows.
 */
export const useFuseSearch = <T>(
  list: readonly T[],
  query: string,
  options: IFuseOptions<T>,
): T[] => {
  return useMemo(
    () => fuseFilter(list, query, options),
    [list, query, options],
  );
};
