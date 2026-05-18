import Fuse, { type FuseResult, type IFuseOptions } from "fuse.js";

const DEFAULT_THRESHOLD = 0.35;
const DEFAULT_DISTANCE = 100;

/**
 * @function defaultFuseSearchOptions
 * @description - Default Fuse search options for UI list filtering (typo-tolerant, location-agnostic).
 * @returns The default Fuse search options.
 */
export const defaultFuseSearchOptions = <T>(): Partial<IFuseOptions<T>> => ({
  threshold: DEFAULT_THRESHOLD,
  distance: DEFAULT_DISTANCE,
  ignoreLocation: true,
  includeScore: true,
});

/**
 * @function createFuseSearcher
 * @description - Create a reusable Fuse index for a list. Reuse the instance when the list is stable.
 * @param {readonly T[]} list - The list to search.
 * @param {IFuseOptions<T>} options - The options for the fuse search.
 * @returns {Fuse<T>} The Fuse index.
 */
export const createFuseSearcher = <T>(list: readonly T[], options: IFuseOptions<T>): Fuse<T> => {
  return new Fuse([...list], options);
};

/**
 * @function fuseFilter
 * @description - Fuzzy-filter `list` by `query`. Returns all items when query is empty.
 * @param {readonly T[]} list - The list to search.
 * @param {string} query - The query to search for.
 * @param {IFuseOptions<T>} options - The options for the fuse search.
 * @returns {T[]} The result of the fuse search.
 */
export const fuseFilter = <T>(list: readonly T[], query: string, options: IFuseOptions<T>): T[] => {
  const trimmed = query.trim();
  if (!trimmed) {
    return [...list];
  }

  return createFuseSearcher(list, options)
    .search(trimmed)
    .map((result) => result.item);
};

/**
 * @function fuseSearch
 * @description - Like `fuseFilter`, but returns full Fuse results (scores, refIndex).
 * @param {readonly T[]} list - The list to search.
 * @param {string} query - The query to search for.
 * @param {IFuseOptions<T>} options - The options for the fuse search.
 * @returns {FuseResult<T>[]} The result of the fuse search.
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
 * @function fuseSearchWithIndex
 * @description - Search using an existing Fuse index (cheap after debounce).
 * @param {Fuse<T>} fuse - The Fuse index to search.
 * @param {readonly T[]} list - The list to search.
 * @param {string} query - The query to search for.
 * @returns {T[]} The result of the fuse search.
 */
export const fuseSearchWithIndex = <T>(fuse: Fuse<T>, list: readonly T[], query: string): T[] => {
  const trimmed = query.trim();
  if (!trimmed) {
    return [...list];
  }
  return fuse.search(trimmed).map((result) => result.item);
};
