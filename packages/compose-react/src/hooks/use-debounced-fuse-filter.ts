import { useMemo } from "react";
import Fuse from "fuse.js";

export interface FuseSearchOptions<T> {
  keys?: (keyof T)[] | string[];
  threshold?: number;
  [key: string]: unknown;
}

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

    const results = fuse.search(searchTerm);
    return results.map((result) => result.item);
  }, [items, searchTerm, options]);
}
