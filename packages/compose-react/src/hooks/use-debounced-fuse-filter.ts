import type { FuseResult } from "fuse.js";
import Fuse from "fuse.js";
import { useMemo } from "react";
import type { FuseSearchOptions } from "./use-fuse/types";

export function useDebouncedFuseFilter<T extends Record<string, unknown>>(
  items: T[],
  searchTerm: string,
  options: FuseSearchOptions<T> = {},
): T[] {
  return useMemo(() => {
    if (!searchTerm.trim()) {
      return items;
    }

    const fuse = new Fuse(items, {
      threshold: 0.3,
      ...options,
    });

    const results: FuseResult<T>[] = fuse.search(searchTerm);
    return results.map((result) => result.item);
  }, [items, searchTerm, options]);
}
