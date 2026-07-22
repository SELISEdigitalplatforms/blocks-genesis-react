import type { IFuseOptions } from "fuse.js";

/**
 * Column-level fuzzy-filter configuration.
 *
 * @typeParam T Row type.
 */
export type ColumnFuseFilterConfig<T> = {
  /** Column identifier used by consumer code. */
  columnId: string;
  /** Search query applied to column keys. */
  query: string;
  /** Fuse keys used for this column search. */
  keys: NonNullable<IFuseOptions<T>["keys"]>;
};
