import { flexRender } from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@blocks/ui/components/table"
import { cn } from "@blocks/ui/lib/utils"

import { DataTableColumnSearchRow } from "./data-table-column-search-row"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableSkeleton } from "./data-table-skeleton"
import type { DataTableRootProps } from "./data-table-types"

export const DataTable = <TData,>({
  table,
  toolbar,
  footer,
  empty,
  isLoading = false,
  skeletonRowCount = 8,
  showColumnSearchRow = false,
  columnSearch = {},
  onColumnSearchChange,
  enablePagination = true,
  pageSizeOptions,
  paginationSummary,
  classNames,
  onRowClick,
}: DataTableRootProps<TData>) => {
  if (isLoading) {
    return (
      <div className={cn("space-y-4", classNames?.root)}>
        {toolbar}
        <DataTableSkeleton rowCount={skeletonRowCount} />
      </div>
    )
  }

  const rows = table.getRowModel().rows
  const columnCount = table.getAllColumns().length

  return (
    <div className={cn("space-y-4", classNames?.root)}>
      {toolbar}

      <div className="rounded-md border border-border bg-card">
        <Table className={classNames?.table}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-muted-foreground">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
            {showColumnSearchRow && onColumnSearchChange ? (
              <DataTableColumnSearchRow
                table={table}
                columnSearch={columnSearch}
                onColumnSearchChange={onColumnSearchChange}
              />
            ) : null}
          </TableHeader>
          <TableBody>
            {!rows.length ? (
              <TableRow>
                <TableCell
                  colSpan={columnCount}
                  className="h-24 text-center text-muted-foreground"
                >
                  {empty ?? "No results."}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className={onRowClick ? "cursor-pointer" : undefined}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  onKeyDown={
                    onRowClick
                      ? (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault()
                            onRowClick(row.original)
                          }
                        }
                      : undefined
                  }
                  tabIndex={onRowClick ? 0 : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {enablePagination ? (
        <DataTablePagination
          table={table}
          pageSizeOptions={pageSizeOptions}
          summary={paginationSummary}
        />
      ) : null}

      {footer}
    </div>
  )
}
