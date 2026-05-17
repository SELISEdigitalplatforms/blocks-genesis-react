import { useMemo } from "react"
import Fuse, { type IFuseOptions } from "fuse.js"

export const useFuseIndex = <T,>(list: readonly T[], options: IFuseOptions<T>): Fuse<T> =>
  useMemo(() => new Fuse([...list], options), [list, options])
