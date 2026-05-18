import type { IFuseOptions } from "fuse.js";

/**
 * @type ColumnFuseFilterConfig
 * @description Column fuse filter configuration.
 * @template T - The type of the items in the list.
 * @property {string} columnId - The ID of the column to filter.
 * @property {string} query - The query to search for.
 * @property {NonNullable<IFuseOptions<T>["keys"]>} keys - The keys to use for the fuse search.
 */
export type ColumnFuseFilterConfig<T> = {
  columnId: string;
  query: string;
  keys: NonNullable<IFuseOptions<T>["keys"]>;
};
