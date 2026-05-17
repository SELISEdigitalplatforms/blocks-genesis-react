import * as React from "react"

import { cn } from "@blocks/ui/lib/utils"

export type DataTableToolbarProps = React.HTMLAttributes<HTMLDivElement>

export const DataTableToolbar = ({ className, ...props }: DataTableToolbarProps) => (
  <div
    className={cn(
      "flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between",
      className,
    )}
    {...props}
  />
)
