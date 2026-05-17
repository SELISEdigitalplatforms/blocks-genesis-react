import { createColumnHelper } from "@tanstack/react-table"
import { useCallback, useMemo, useState } from "react"

import { useDebouncedColumnFuseFilters } from "@blocks-kit/hooks"
import { useDebouncedFuseFilter } from "@blocks-kit/hooks"
import { defaultFuseSearchOptions } from "@blocks-kit/hooks"

import { DataTable } from "./data-table"
import { getColumnDefId, type BlocksDataTableProps } from "./data-table-types"
import { useBlocksDataTable } from "./use-blocks-data-table"

export const BlocksDataTable = <TData extends Record<string, unknown>>({
  data,
  columns,
  toolbar,
  footer,
  empty,
  isLoading,
  skeletonRowCount,
  enableSorting = true,
  enablePagination = true,
  showColumnSearchRow = false,
  columnSearch: controlledColumnSearch,
  onColumnSearchChange,
  globalSearch: controlledGlobalSearch,
  fuseGlobal,
  pagination,
  sorting,
  onSortingChange,
  paginationSummary,
  tableOptions,
  classNames,
  onRowClick,
}: BlocksDataTableProps<TData>) => {
  const [internalColumnSearch, setInternalColumnSearch] = useState<Record<string, string>>({})

  const globalSearch = controlledGlobalSearch ?? ""
  const columnSearch = controlledColumnSearch ?? internalColumnSearch

  const handleColumnSearchChange = useCallback(
    (columnId: string, value: string) => {
      if (onColumnSearchChange) {
        onColumnSearchChange(columnId, value)
        return
      }
      setInternalColumnSearch((prev) => ({ ...prev, [columnId]: value }))
    },
    [onColumnSearchChange],
  )

  const getKeysForColumn = useCallback(
    (columnId: string) => {
      for (const col of columns) {
        if (getColumnDefId(col) === columnId) {
          return col.meta?.searchKeys
        }
      }
      return undefined
    },
    [columns],
  )

  const fuseGlobalOptions = useMemo(() => {
    if (!fuseGlobal?.keys) {
      return null
    }
    return {
      ...defaultFuseSearchOptions<TData>(),
      keys: fuseGlobal.keys,
      ...(fuseGlobal.threshold !== undefined ? { threshold: fuseGlobal.threshold } : {}),
    }
  }, [fuseGlobal])

  const fallbackFuseOptions = useMemo(
    () => ({ ...defaultFuseSearchOptions<TData>(), keys: [] as string[] }),
    [],
  )

  const globallyFiltered = useDebouncedFuseFilter(
    data,
    fuseGlobalOptions ? globalSearch : "",
    fuseGlobalOptions ?? fallbackFuseOptions,
    fuseGlobal?.debounceMs ?? 250,
  )

  const sourceRows = fuseGlobalOptions ? globallyFiltered : data

  const columnFiltered = useDebouncedColumnFuseFilters(
    sourceRows,
    showColumnSearchRow ? columnSearch : {},
    getKeysForColumn,
    250,
  )

  const table = useBlocksDataTable({
    data: columnFiltered,
    columns,
    enableSorting,
    enablePagination,
    paginationMode: pagination?.mode ?? "client",
    pageCount: pagination?.pageCount,
    pageSizeOptions: pagination?.pageSizeOptions,
    pagination: pagination?.state,
    onPaginationChange: pagination?.onPaginationChange,
    sorting,
    onSortingChange,
    tableOptions,
  })

  return (
    <DataTable
      table={table}
      toolbar={toolbar}
      footer={footer}
      empty={empty}
      isLoading={isLoading}
      skeletonRowCount={skeletonRowCount}
      showColumnSearchRow={showColumnSearchRow}
      columnSearch={columnSearch}
      onColumnSearchChange={handleColumnSearchChange}
      enablePagination={enablePagination}
      pageSizeOptions={pagination?.pageSizeOptions}
      paginationSummary={paginationSummary}
      classNames={classNames}
      onRowClick={onRowClick}
    />
  )
}

export const createBlocksColumnHelper = createColumnHelper
