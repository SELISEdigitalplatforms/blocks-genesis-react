import { flexRender, type Header } from "@tanstack/react-table";
import type { ReactNode } from "react";
import type { SortValue } from "../filter-toolbar";
import { FilterControls } from "../filter-toolbar";

type DataTableHeaderCellProps<TData> = {
  header: Header<TData, unknown>;
  sortValue: SortValue;
  onSortChange: (value: SortValue) => void;
  renderHeaderCell?: (header: Header<TData, unknown>) => ReactNode;
};

/**
 * Resolves header cell content via a priority chain:
 *
 * 1. `renderHeaderCell` prop   — full consumer override (applies to all columns)
 * 2. Column `header` function  — standard TanStack Table per-column definition
 * 3. `meta.sortable: true`     — auto-renders FilterControls.SortHeader
 * 4. `meta.label`              — plain text label
 * 5. Fallback                  — column id as plain text
 */
export function DataTableHeaderCell<TData>({
  header,
  sortValue,
  onSortChange,
  renderHeaderCell,
}: DataTableHeaderCellProps<TData>) {
  if (header.isPlaceholder) return null;

  // Priority 1: full global override
  if (renderHeaderCell) {
    return <>{renderHeaderCell(header)}</>;
  }

  // Priority 2: explicit per-column header function
  if (header.column.columnDef.header) {
    return (
      <>{flexRender(header.column.columnDef.header, header.getContext())}</>
    );
  }

  const { label, sortId, sortable } = header.column.columnDef.meta ?? {};
  const displayLabel = label ?? header.column.id;

  // Priority 3: meta-driven sort header
  if (sortable) {
    return (
      <FilterControls.SortHeader
        id={sortId ?? header.column.id}
        label={displayLabel}
        value={sortValue}
        onChange={onSortChange}
      />
    );
  }

  // Priority 4 / 5: plain text
  return <span>{displayLabel}</span>;
}
