import { useMemo } from "react";
import Fuse, { type IFuseOptions } from "fuse.js";

/**
 * @hook useFuseIndex
 * @description - Create a reusable Fuse index for a list. Reuse the instance when the list is stable.
 * @param {readonly T[]} list - The list to search.
 * @param {IFuseOptions<T>} options - The options for the fuse search.
 * @returns {Fuse<T>} The Fuse index.
 */
export const useFuseIndex = <T>(list: readonly T[], options: IFuseOptions<T>): Fuse<T> =>
  useMemo(() => new Fuse([...list], options), [list, options]);
