import { useMemo } from "react"
import type { IFuseOptions } from "fuse.js"

import { fuseFilter } from "./utils/fuse-search"

/**
 * Memoized fuzzy filter for React lists. Pass a stable `options` object (e.g. from useMemo)
 * when keys/threshold should not change every render.
 */
export const useFuseSearch = <T>(
  list: readonly T[],
  query: string,
  options: IFuseOptions<T>,
): T[] => {
  return useMemo(() => fuseFilter(list, query, options), [list, query, options])
}
