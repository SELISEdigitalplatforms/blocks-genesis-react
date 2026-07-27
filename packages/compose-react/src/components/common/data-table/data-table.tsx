import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import { FilterControls, type SortValue } from "../filter-toolbar";
import {
  ScrollArea,
  ScrollBar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/core";
import { DataTableHeaderCell } from "./data-table-header-cell";
import type { DataTableProps } from "./data-table.types";
import { TableLoadingSkeleton } from "./data-table-skeleton";

// Stable no-op avoids creating a new function reference on every render
const noop = () => {
  /* intentional no-op */
};

export function DataTable<TData>(props: DataTableProps<TData>) {
  const {
    data,
    columns,
    isLoading = false,
    renderLoader,
    renderEmptyState,
    onRowClick,
    pagination,
    scrollable = true,
    tableOptions,
    renderHeaderCell,
  } = props;

  // ── Sort resolution ───────────────────────────────────────────────────────
  // nuqs hooks are always called unconditionally (React rules).
  // Their values are ignored when sort is controlled externally.
  const sortNamespace =
    "sortNamespace" in props ? props.sortNamespace : undefined;
  const defaultSortValue =
    "defaultSortValue" in props ? props.defaultSortValue : undefined;

  const ns = sortNamespace ?? "dt";

  const [internalProperty, setInternalProperty] = useQueryState(
    `${ns}_sortProperty`,
    parseAsString.withDefault(defaultSortValue?.property ?? ""),
  );
  const [internalDescending, setInternalDescending] = useQueryState(
    `${ns}_isDescending`,
    parseAsBoolean.withDefault(defaultSortValue?.isDescending ?? false),
  );

  const effectiveSortValue: SortValue =
    props.sortValue !== undefined
      ? props.sortValue
      : { property: internalProperty, isDescending: internalDescending };

  const effectiveOnSortChange =
    props.onSortChange !== undefined
      ? props.onSortChange
      : (value: SortValue) => {
          void setInternalProperty(value.property);
          void setInternalDescending(value.isDescending);
        };

  // ── Table instance ────────────────────────────────────────────────────────
  const table = useReactTable<TData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...tableOptions,
  });

  // ── Render ────────────────────────────────────────────────────────────────
  const thead = (
    <TableHeader>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow
          key={headerGroup.id}
          className="px-4 py-2 hover:bg-transparent"
        >
          {headerGroup.headers.map((header) => (
            <TableHead
              key={header.id}
              className="font-bold text-medium-emphasis"
            >
              <DataTableHeaderCell
                header={header}
                sortValue={effectiveSortValue}
                onSortChange={effectiveOnSortChange}
                renderHeaderCell={renderHeaderCell}
              />
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeader>
  );

  // renderLoader is responsible for its own <TableBody> wrapper
  const tbody = isLoading ? (
    (renderLoader ?? <TableLoadingSkeleton table={table} />)
  ) : (
    <TableBody>
      {table.getRowModel().rows.length > 0 ? (
        table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            data-state={row.getIsSelected() ? "selected" : undefined}
            className="text-medium-emphasis"
            isHoverable={!!onRowClick}
            onClick={onRowClick ? () => onRowClick(row.original) : undefined}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell
            colSpan={table.getAllColumns().length}
            className="h-24 text-center text-muted-foreground"
          >
            {renderEmptyState ?? "No results."}
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );

  const tableNode = (
    <Table className="text-sm">
      {thead}
      {tbody}
    </Table>
  );

  return (
    <div className="w-full">
      {scrollable ? (
        <ScrollArea className="w-full">
          {tableNode}
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : (
        <div className="overflow-x-auto">{tableNode}</div>
      )}

      {pagination && pagination.totalCount > pagination.pageSize && (
        <div className="mt-5 flex items-center justify-end">
          <FilterControls.TablePagination
            pageIndex={pagination.pageNumber}
            pageSize={pagination.pageSize}
            pageSizeOptions={pagination.pageSizeOptions ?? [5, 10, 15]}
            onPageChange={pagination.onPageChange ?? noop}
            onPageSizeChange={pagination.onPageSizeChange ?? noop}
            pageCount={Math.ceil(pagination.totalCount / pagination.pageSize)}
          />
        </div>
      )}
    </div>
  );
}
