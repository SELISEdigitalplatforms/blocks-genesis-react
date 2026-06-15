import type { FuseResult, IFuseOptions } from "fuse.js";

/**
 * Alias for Fuse.js search options.
 *
 * @typeParam T Row type.
 */
export type FuseSearchOptions<T> = IFuseOptions<T>;

/**
 * Alias for Fuse.js search results.
 *
 * @typeParam T Row type.
 */
export type FuseSearchResult<T> = FuseResult<T>;
