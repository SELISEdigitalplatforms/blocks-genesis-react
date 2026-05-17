import { Search } from "lucide-react"

import { Input } from "@blocks/ui/components/input"
import { cn } from "@blocks/ui/lib/utils"

export type DataTableGlobalSearchProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export const DataTableGlobalSearch = ({
  value,
  onChange,
  placeholder = "Search…",
  className,
}: DataTableGlobalSearchProps) => (
  <div className={cn("relative w-full max-w-sm", className)}>
    <Search
      className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      aria-hidden
    />
    <Input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label="Search table"
      className="h-9 pl-8"
    />
  </div>
)
