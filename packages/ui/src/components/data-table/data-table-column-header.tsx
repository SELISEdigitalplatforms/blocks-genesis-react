import type { Column } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

import { Button } from "@blocks-kit/ui/components/button"
import { cn } from "@blocks-kit/ui/lib/utils"

type DataTableColumnHeaderProps<TData, TValue> = React.HTMLAttributes<HTMLDivElement> & {
  column: Column<TData, TValue>
  title: string
}

const SortIcon = ({ sorted }: { sorted: false | "asc" | "desc" }) => {
  if (sorted === "desc") {
    return <ArrowDown className="size-4 shrink-0" aria-hidden />
  }
  if (sorted === "asc") {
    return <ArrowUp className="size-4 shrink-0" aria-hidden />
  }
  return <ArrowUpDown className="size-4 shrink-0" aria-hidden />
}

export const DataTableColumnHeader = <TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) => {
  if (column.columnDef.meta?.disableSort || !column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  const sorted = column.getIsSorted()

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        "h-8 max-w-full justify-start gap-2 px-2 font-medium text-muted-foreground hover:text-foreground",
        className,
      )}
      aria-label={`Sort by ${title}`}
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      <span className="min-w-0 truncate">{title}</span>
      <SortIcon sorted={sorted} />
    </Button>
  )
}
