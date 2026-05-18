import { useMemo } from "react";
import type { IFuseOptions } from "fuse.js";
import { useDebouncedValue } from "./use-debounced-value";
import { useFuseIndex } from "@/use-fuse";
import { defaultFuseSearchOptions, fuseSearchWithIndex } from "@/utils/fuse-search";

/**
 * @hook useDebouncedFuseFilter
 * @description - Debounce a Fuse search for a specified delay.
 * @param {readonly T[]} list - The list to search.
 * @param {string} query - The query to search for.
 * @param {IFuseOptions<T>} fuseOptions - The options for the fuse search.
 * @param {number} debounceMs - The delay in milliseconds.
 * @returns {T[]} The debounced result of the fuse search.
 */
export const useDebouncedFuseFilter = <T>(
  list: readonly T[],
  query: string,
  fuseOptions: IFuseOptions<T>,
  debounceMs = 250,
): T[] => {
  const debouncedQuery = useDebouncedValue(query, debounceMs);
  const mergedOptions = useMemo(
    () => ({ ...defaultFuseSearchOptions<T>(), ...fuseOptions }),
    [fuseOptions],
  );
  const fuse = useFuseIndex(list, mergedOptions);

  return useMemo(
    () => fuseSearchWithIndex(fuse, list, debouncedQuery),
    [fuse, list, debouncedQuery],
  );
};
