import { useMemo } from "react"
import type { IFuseOptions } from "fuse.js"

import { useDebouncedValue } from "@blocks/ui/hooks/use-debounced-value"
import { useFuseIndex } from "@blocks/ui/hooks/use-fuse-index"
import { defaultFuseSearchOptions, fuseSearchWithIndex } from "@blocks/ui/utils/fuse-search"

export const useDebouncedFuseFilter = <T,>(
  list: readonly T[],
  query: string,
  fuseOptions: IFuseOptions<T>,
  debounceMs = 250,
): T[] => {
  const debouncedQuery = useDebouncedValue(query, debounceMs)
  const mergedOptions = useMemo(
    () => ({ ...defaultFuseSearchOptions<T>(), ...fuseOptions }),
    [fuseOptions],
  )
  const fuse = useFuseIndex(list, mergedOptions)

  return useMemo(
    () => fuseSearchWithIndex(fuse, list, debouncedQuery),
    [fuse, list, debouncedQuery],
  )
}
