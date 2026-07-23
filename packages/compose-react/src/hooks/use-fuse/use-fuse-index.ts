import { useMemo } from "react";
import Fuse, { type IFuseOptions } from "fuse.js";

/**
 * Creates a memoized Fuse.js index for a list.
 *
 * @typeParam T Row type.
 * @param list Source rows.
 * @param options Fuse.js options.
 * @returns Memoized Fuse index.
 */
export const useFuseIndex = <T>(
  list: readonly T[],
  options: IFuseOptions<T>,
): Fuse<T> => useMemo(() => new Fuse([...list], options), [list, options]);
