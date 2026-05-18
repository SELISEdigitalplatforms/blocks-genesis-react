import type { FuseResult, IFuseOptions } from "fuse.js";

/**
 * @type FuseSearchOptions
 * @description - The options for the fuse search.
 * @template T - The type of the items to search.
 * @property {IFuseOptions<T>} - The options for the fuse search.
 */
export type FuseSearchOptions<T> = IFuseOptions<T>;

/**
 * @type FuseSearchResult
 * @description - The result of the fuse search.
 * @template T - The type of the items to search.
 * @property {FuseResult<T>} - The result of the fuse search.
 */
export type FuseSearchResult<T> = FuseResult<T>;
