import type { Table } from "@tanstack/react-table"

import { TablePagination } from "@blocks-kit/ui/components/table-pagination"

export type DataTablePaginationProps<TData> = {
  table: Table<TData>
  pageSizeOptions?: number[]
  summary?: React.ReactNode
}

export const DataTablePagination = <TData,>({
  table,
  pageSizeOptions,
  summary,
}: DataTablePaginationProps<TData>) => {
  const { pageIndex, pageSize } = table.getState().pagination
  const pageCount = table.getPageCount()

  return (
    <TablePagination
      pageIndex={pageIndex}
      pageCount={pageCount}
      pageSize={pageSize}
      pageSizeOptions={pageSizeOptions}
      summary={summary}
      onPageChange={(page) => table.setPageIndex(page)}
      onPageSizeChange={(size) => table.setPageSize(size)}
    />
  )
}
