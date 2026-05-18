import { useMemo } from "react";
import type { IFuseOptions } from "fuse.js";
import { fuseFilter } from "@/utils/fuse-search";

/**
 * @hook useFuseSearch
 * @description - Memoized fuzzy filter for React lists. Pass a stable `options` object (e.g. from useMemo)
 * when keys/threshold should not change every render.
 * @param {readonly T[]} list - The list to search.
 * @param {string} query - The query to search for.
 * @param {IFuseOptions<T>} options - The options for the fuse search.
 * @returns {T[]} The result of the fuse search.
 */
export const useFuseSearch = <T>(
  list: readonly T[],
  query: string,
  options: IFuseOptions<T>,
): T[] => {
  return useMemo(() => fuseFilter(list, query, options), [list, query, options]);
};
