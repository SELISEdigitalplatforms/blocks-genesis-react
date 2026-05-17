import Fuse, { type FuseResult, type IFuseOptions } from "fuse.js"

export type FuseSearchOptions<T> = IFuseOptions<T>
export type FuseSearchResult<T> = FuseResult<T>

const DEFAULT_THRESHOLD = 0.35
const DEFAULT_DISTANCE = 100

/** Sensible defaults for UI list filtering (typo-tolerant, location-agnostic). */
export const defaultFuseSearchOptions = <T>(): Partial<IFuseOptions<T>> => ({
  threshold: DEFAULT_THRESHOLD,
  distance: DEFAULT_DISTANCE,
  ignoreLocation: true,
  includeScore: true,
})

/** Create a reusable Fuse index for a list. Reuse the instance when the list is stable. */
export const createFuseSearcher = <T>(
  list: readonly T[],
  options: IFuseOptions<T>,
): Fuse<T> => {
  return new Fuse([...list], options)
}

/** Fuzzy-filter `list` by `query`. Returns all items when query is empty. */
export const fuseFilter = <T>(
  list: readonly T[],
  query: string,
  options: IFuseOptions<T>,
): T[] => {
  const trimmed = query.trim()
  if (!trimmed) {
    return [...list]
  }

  return createFuseSearcher(list, options)
    .search(trimmed)
    .map((result) => result.item)
}

/** Like `fuseFilter`, but returns full Fuse results (scores, refIndex). */
export const fuseSearch = <T>(
  list: readonly T[],
  query: string,
  options: IFuseOptions<T>,
): FuseResult<T>[] => {
  const trimmed = query.trim()
  if (!trimmed) {
    return list.map((item, refIndex) => ({
      item,
      refIndex,
    }))
  }

  return createFuseSearcher(list, options).search(trimmed)
}

/** Search using an existing Fuse index (cheap after debounce). */
export const fuseSearchWithIndex = <T>(
  fuse: Fuse<T>,
  list: readonly T[],
  query: string,
): T[] => {
  const trimmed = query.trim()
  if (!trimmed) {
    return [...list]
  }
  return fuse.search(trimmed).map((result) => result.item)
}
