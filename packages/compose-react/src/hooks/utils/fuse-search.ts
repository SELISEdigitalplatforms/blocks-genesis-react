import Fuse, { type FuseResult, type IFuseOptions } from "fuse.js";

const DEFAULT_THRESHOLD = 0.35;
const DEFAULT_DISTANCE = 100;

/**
 * Returns default Fuse.js options suitable for UI search inputs.
 *
 * @typeParam T Row type.
 * @returns Default Fuse.js options.
 */
export const defaultFuseSearchOptions = <T>(): Partial<IFuseOptions<T>> => ({
  threshold: DEFAULT_THRESHOLD,
  distance: DEFAULT_DISTANCE,
  ignoreLocation: true,
  includeScore: true,
});

/**
 * Creates a Fuse.js search index for the given rows.
 *
 * @typeParam T Row type.
 * @param list Source rows.
 * @param options Fuse.js options.
 * @returns Fuse.js instance.
 */
export const createFuseSearcher = <T>(
  list: readonly T[],
  options: IFuseOptions<T>,
): Fuse<T> => {
  return new Fuse([...list], options);
};

/**
 * Fuzzy-filters rows by query string.
 *
 * @typeParam T Row type.
 * @param list Source rows.
 * @param query Search query.
 * @param options Fuse.js options.
 * @returns Filtered rows. Returns all rows when query is empty.
 */
export const fuseFilter = <T>(
  list: readonly T[],
  query: string,
  options: IFuseOptions<T>,
): T[] => {
  const trimmed = query.trim();
  if (!trimmed) {
    return [...list];
  }

  return createFuseSearcher(list, options)
    .search(trimmed)
    .map((result) => result.item);
};

/**
 * Fuzzy-searches rows and returns full Fuse.js metadata.
 *
 * @typeParam T Row type.
 * @param list Source rows.
 * @param query Search query.
 * @param options Fuse.js options.
 * @returns Fuse.js search results including scores and ref indices.
 */
export const fuseSearch = <T>(
  list: readonly T[],
  query: string,
  options: IFuseOptions<T>,
): FuseResult<T>[] => {
  const trimmed = query.trim();
  if (!trimmed) {
    return list.map((item, refIndex) => ({
      item,
      refIndex,
    }));
  }

  return createFuseSearcher(list, options).search(trimmed);
};

/**
 * Fuzzy-searches using an existing Fuse.js index.
 *
 * @typeParam T Row type.
 * @param fuse Existing Fuse index.
 * @param list Source rows.
 * @param query Search query.
 * @returns Filtered rows. Returns all rows when query is empty.
 */
export const fuseSearchWithIndex = <T>(
  fuse: Fuse<T>,
  list: readonly T[],
  query: string,
): T[] => {
  const trimmed = query.trim();
  if (!trimmed) {
    return [...list];
  }
  return fuse.search(trimmed).map((result) => result.item);
};
