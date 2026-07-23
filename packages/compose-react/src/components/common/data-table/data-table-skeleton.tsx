import { Skeleton, TableBody, TableCell, TableRow } from "@/components/core";
import type { Table } from "@tanstack/react-table";

type TableLoadingSkeletonProps<TData> = {
  table: Table<TData>;
};

export const TableLoadingSkeleton = <TData,>({
  table,
}: TableLoadingSkeletonProps<TData>) => (
  <TableBody>
    {["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"].map((rowKey) => (
      <TableRow key={rowKey}>
        <TableCell colSpan={table.getVisibleLeafColumns().length}>
          <Skeleton className="h-12 w-full rounded-xl" />
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
);
