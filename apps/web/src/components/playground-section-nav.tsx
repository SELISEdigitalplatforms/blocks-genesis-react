import * as React from "react"
import { Search } from "lucide-react"
import { Input } from "@blocks-kit/ui/components/input"
import { useFuseSearch } from "@blocks-kit/hooks"
import {
  defaultFuseSearchOptions,
  type FuseSearchOptions,
} from "@blocks-kit/hooks"
import { cn } from "@blocks-kit/ui/lib/utils"

export type PlaygroundSectionLink = {
  id: string
  title: string
  description?: string
}

type PlaygroundSectionNavProps = {
  sections: PlaygroundSectionLink[]
  onNavigate?: () => void
  className?: string
}

const sectionFuseOptions: FuseSearchOptions<PlaygroundSectionLink> = {
  ...defaultFuseSearchOptions<PlaygroundSectionLink>(),
  keys: ["title", "description"],
}

export const PlaygroundSectionNav = ({
  sections,
  onNavigate,
  className,
}: PlaygroundSectionNavProps) => {
  const [query, setQuery] = React.useState("")
  const filteredSections = useFuseSearch(sections, query, sectionFuseOptions)

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search sections…"
          className="pl-8"
          aria-label="Search playground sections"
        />
      </div>
      <nav aria-label="Sections" className="space-y-1 text-sm">
        {filteredSections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            onClick={onNavigate}
            className="block rounded-md px-3 py-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:px-2 md:py-1"
          >
            {section.title}
          </a>
        ))}
        {filteredSections.length === 0 ? (
          <p className="px-2 py-2 text-xs text-muted-foreground">No sections match your search.</p>
        ) : null}
      </nav>
    </div>
  )
}
