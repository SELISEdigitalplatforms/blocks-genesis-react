import { MoreHorizontal } from "lucide-react"

import { Button } from "@blocks-kit/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@blocks-kit/ui/components/dropdown-menu"

export type DataTableRowActionsProps = {
  children: React.ReactNode
  align?: "start" | "center" | "end"
  label?: string
}

export const DataTableRowActions = ({
  children,
  align = "end",
  label = "Open row actions",
}: DataTableRowActionsProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8"
        aria-label={label}
        onClick={(event) => event.stopPropagation()}
      >
        <MoreHorizontal className="size-4" aria-hidden />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align={align}>{children}</DropdownMenuContent>
  </DropdownMenu>
)
