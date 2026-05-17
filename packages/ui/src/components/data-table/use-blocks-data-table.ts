import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  type TableOptions,
} from "@tanstack/react-table"
import { useState } from "react"

import type { BlocksDataTableColumnDef, DataTablePaginationMode } from "./data-table-types"

export type UseBlocksDataTableProps<TData extends Record<string, unknown>> = {
  data: TData[]
  columns: BlocksDataTableColumnDef<TData>[]
  enableSorting?: boolean
  enablePagination?: boolean
  paginationMode?: DataTablePaginationMode
  pageCount?: number
  pageSizeOptions?: number[]
  initialPagination?: PaginationState
  initialSorting?: SortingState
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  pagination?: PaginationState
  onPaginationChange?: OnChangeFn<PaginationState>
  tableOptions?: Partial<TableOptions<TData>>
}

const DEFAULT_PAGE_SIZE = 10

export const useBlocksDataTable = <TData extends Record<string, unknown>>({
  data,
  columns,
  enableSorting = true,
  enablePagination = true,
  paginationMode = "client",
  pageCount,
  initialPagination = { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE },
  initialSorting = [],
  sorting: controlledSorting,
  onSortingChange: controlledOnSortingChange,
  pagination: controlledPagination,
  onPaginationChange: controlledOnPaginationChange,
  tableOptions,
}: UseBlocksDataTableProps<TData>) => {
  const [internalSorting, setInternalSorting] = useState<SortingState>(initialSorting)
  const [internalPagination, setInternalPagination] = useState<PaginationState>(initialPagination)

  const sorting = controlledSorting ?? internalSorting
  const onSortingChange = controlledOnSortingChange ?? setInternalSorting
  const pagination = controlledPagination ?? internalPagination
  const onPaginationChange = controlledOnPaginationChange ?? setInternalPagination

  const manualPagination = paginationMode === "server"

  return useReactTable({
    data,
    columns,
    state: {
      sorting: enableSorting ? sorting : [],
      pagination: enablePagination ? pagination : undefined,
    },
    onSortingChange: enableSorting ? onSortingChange : undefined,
    onPaginationChange: enablePagination ? onPaginationChange : undefined,
    manualPagination,
    pageCount: manualPagination ? pageCount : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getPaginationRowModel:
      enablePagination && !manualPagination ? getPaginationRowModel() : undefined,
    ...tableOptions,
  })
}
