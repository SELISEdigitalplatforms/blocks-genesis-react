import type { Header, RowData, TableOptions } from "@tanstack/react-table";
import type { ReactNode } from "react";
import type { SortValue } from "../filter-toolbar/sort-header";

// ─── Global ColumnMeta augmentation ─────────────────────────────────────────
// Enables Option C: meta-driven header rendering alongside explicit header
// functions, with a plain-text fallback when neither is provided.
declare module "@tanstack/react-table" {
  // TS declaration merging (TS2428) forces the exact type parameter names of
  // tanstack's own `ColumnMeta<TData extends RowData, TValue>` declaration,
  // so they cannot be renamed to match the unused-var ignore pattern or
  // removed. This is the augmentation pattern from the TanStack Table docs,
  // which carry this same suppression. Confirmed false positive.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Display label for auto-rendered headers and sort controls */
    label?: string;
    /** Sort key sent to onSortChange. Defaults to column id when omitted */
    sortId?: string;
    /** Auto-renders a FilterControls.SortHeader when true and no explicit header is defined */
    sortable?: boolean;
  }
}

// ─── Sort ────────────────────────────────────────────────────────────────────

/**
 * Discriminated union enforcing that sort props are always all-or-nothing.
 *
 * Controlled   — pass both `sortValue` + `onSortChange`; parent owns sort state.
 * Uncontrolled — pass neither; DataTable manages sort state internally via nuqs.
 */
type ControlledSort = {
  sortValue: SortValue;
  onSortChange: (value: SortValue) => void;
  sortNamespace?: never;
  defaultSortValue?: never;
};

type UncontrolledSort = {
  sortValue?: never;
  onSortChange?: never;
  /**
   * Namespaces the nuqs URL keys used for sort state.
   * Necessary when multiple DataTables with uncontrolled sort exist on the same page.
   * Defaults to "dt".
   */
  sortNamespace?: string;
  /**
   * Initial sort applied when no URL params exist yet.
   * Defaults to { property: "", isDescending: false }.
   */
  defaultSortValue?: SortValue;
};

export type DataTableSortProps = ControlledSort | UncontrolledSort;

// ─── Pagination ──────────────────────────────────────────────────────────────

export type PaginationConfig = {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  /** Defaults to [5, 10, 15] */
  pageSizeOptions?: number[];
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
};

// ─── DataTable ───────────────────────────────────────────────────────────────

export type DataTableProps<TData> = {
  data: TData[];
  /** Exactly what useReactTable accepts: tanstack types this as ColumnDef<TData, any>[] */
  columns: TableOptions<TData>["columns"];
  /** Shows the loader when true */
  isLoading?: boolean;
  /**
   * Replaces the default LoadingSkeleton.
   * Must render its own <TableBody> since it substitutes the entire body section.
   */
  renderLoader?: ReactNode;
  /** Shown when data is empty. Defaults to a centered "No results." */
  renderEmptyState?: ReactNode;
  /** Enables row click. Hover styles are auto-applied when provided */
  onRowClick?: (row: TData) => void;
  /** Renders pagination below the table. Hidden when omitted */
  pagination?: PaginationConfig;
  /**
   * Wraps the table in a horizontal ScrollArea.
   * Defaults to true.
   */
  scrollable?: boolean;
  /**
   * Forwarded to useReactTable.
   * Use for columnVisibility, rowSelection, expanded state, etc.
   */
  tableOptions?: Partial<TableOptions<TData>>;
  /**
   * Overrides the rendering of all header cells.
   * For per-column customization, prefer the column's own `header` function instead.
   */
  renderHeaderCell?: (header: Header<TData, unknown>) => ReactNode;
} & DataTableSortProps;
