import type { Table } from "@tanstack/react-table"

import { Input } from "@blocks/ui/components/input"
import { TableHead, TableRow } from "@blocks/ui/components/table"

import type { ColumnSearchState } from "./data-table-types"

export type DataTableColumnSearchRowProps<TData> = {
  table: Table<TData>
  columnSearch: ColumnSearchState
  onColumnSearchChange: (columnId: string, value: string) => void
}

export const DataTableColumnSearchRow = <TData,>({
  table,
  columnSearch,
  onColumnSearchChange,
}: DataTableColumnSearchRowProps<TData>) => {
  const headerGroup = table.getHeaderGroups()[0]
  if (!headerGroup) {
    return null
  }

  return (
    <TableRow className="border-b border-border hover:bg-transparent">
      {headerGroup.headers.map((header) => {
        const searchKeys = header.column.columnDef.meta?.searchKeys
        return (
          <TableHead key={`${header.id}-search`} className="bg-muted/30 py-2">
            {searchKeys?.length ? (
              <Input
                type="search"
                aria-label={`Search ${header.column.id}`}
                placeholder="Search…"
                value={columnSearch[header.column.id] ?? ""}
                onChange={(event) => onColumnSearchChange(header.column.id, event.target.value)}
                className="h-8 border-border bg-background text-sm"
              />
            ) : null}
          </TableHead>
        )
      })}
    </TableRow>
  )
}
