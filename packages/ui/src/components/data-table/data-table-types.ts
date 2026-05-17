import type {
  ColumnDef,
  OnChangeFn,
  PaginationState,
  SortingState,
  Table,
  TableOptions,
} from "@tanstack/react-table"
import type { ReactNode } from "react"

import type { FuseSearchOptions } from "@blocks/ui/utils/fuse-search"

export type DataTablePaginationMode = "client" | "server"

/**
 * Accepts columns from `createColumnHelper` / mixed accessors (string, number, etc.).
 * `ColumnDef<TData, unknown>[]` is too narrow for heterogeneous column value types.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BlocksDataTableColumnDef<TData> = ColumnDef<TData, any>

export type DataTableFuseGlobalConfig<TData> = {
  keys: FuseSearchOptions<TData>["keys"]
  debounceMs?: number
  threshold?: number
}

export type DataTableClassNames = {
  root?: string
  table?: string
}

export type DataTableRootProps<TData> = {
  table: Table<TData>
  toolbar?: ReactNode
  footer?: ReactNode
  empty?: ReactNode
  isLoading?: boolean
  skeletonRowCount?: number
  showColumnSearchRow?: boolean
  columnSearch?: Record<string, string>
  onColumnSearchChange?: (columnId: string, value: string) => void
  enablePagination?: boolean
  pageSizeOptions?: number[]
  paginationSummary?: ReactNode
  classNames?: DataTableClassNames
  onRowClick?: (row: TData) => void
}

export type BlocksDataTableProps<TData extends Record<string, unknown>> = {
  data: TData[]
  columns: BlocksDataTableColumnDef<TData>[]
  toolbar?: ReactNode
  footer?: ReactNode
  empty?: ReactNode
  isLoading?: boolean
  skeletonRowCount?: number
  enableSorting?: boolean
  enablePagination?: boolean
  showColumnSearchRow?: boolean
  columnSearch?: Record<string, string>
  onColumnSearchChange?: (columnId: string, value: string) => void
  globalSearch?: string
  onGlobalSearchChange?: (query: string) => void
  fuseGlobal?: DataTableFuseGlobalConfig<TData>
  pagination?: {
    mode?: DataTablePaginationMode
    pageCount?: number
    pageSizeOptions?: number[]
    state?: PaginationState
    onPaginationChange?: OnChangeFn<PaginationState>
  }
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  paginationSummary?: ReactNode
  tableOptions?: Partial<TableOptions<TData>>
  classNames?: DataTableClassNames
  onRowClick?: (row: TData) => void
}

export type ColumnSearchState = Record<string, string>

export const getColumnDefId = <TData,>(col: BlocksDataTableColumnDef<TData>): string | undefined => {
  if (col.id) {
    return col.id
  }
  if ("accessorKey" in col && typeof col.accessorKey === "string") {
    return col.accessorKey
  }
  return undefined
}
