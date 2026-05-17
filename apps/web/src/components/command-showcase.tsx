import * as React from "react"
import {
  Calendar as CalendarIcon,
  ChevronRight,
  Search,
  Settings,
  User as UserIcon,
} from "lucide-react"

import { Button } from "@blocks-kit/ui/components/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@blocks-kit/ui/components/command"
import { useFuseSearch } from "@blocks-kit/hooks"
import {
  defaultFuseSearchOptions,
  type FuseSearchOptions,
} from "@blocks-kit/hooks"

type CommandPaletteEntry = {
  id: string
  label: string
  group: string
  keywords?: string
  icon: React.ComponentType<{ className?: string }>
  shortcut?: string
}

const COMMAND_PALETTE_ENTRIES: CommandPaletteEntry[] = [
  {
    id: "calendar",
    label: "Calendar",
    group: "Suggestions",
    keywords: "date schedule",
    icon: CalendarIcon,
  },
  {
    id: "search",
    label: "Search",
    group: "Suggestions",
    keywords: "find filter",
    icon: Search,
  },
  {
    id: "profile",
    label: "Profile",
    group: "Account",
    keywords: "user account",
    icon: UserIcon,
    shortcut: "⌘P",
  },
  {
    id: "settings",
    label: "Settings",
    group: "Account",
    keywords: "preferences config",
    icon: Settings,
    shortcut: "⌘,",
  },
  {
    id: "home",
    label: "Go home",
    group: "Navigation",
    keywords: "dashboard start",
    icon: ChevronRight,
  },
  {
    id: "open-settings",
    label: "Open settings",
    group: "Navigation",
    keywords: "preferences",
    icon: Settings,
  },
]

const commandFuseOptions: FuseSearchOptions<CommandPaletteEntry> = {
  ...defaultFuseSearchOptions<CommandPaletteEntry>(),
  keys: ["label", "group", "keywords"],
}

const CommandPaletteList = ({
  entries,
  onSelect,
}: {
  entries: CommandPaletteEntry[]
  onSelect?: () => void
}) => {
  const groups = Array.from(new Set(entries.map((entry) => entry.group)))

  return (
    <CommandList>
      <CommandEmpty>No results.</CommandEmpty>
      {groups.map((group) => {
        const groupEntries = entries.filter((entry) => entry.group === group)
        if (groupEntries.length === 0) return null

        return (
          <CommandGroup key={group} heading={group}>
            {groupEntries.map((entry) => {
              const Icon = entry.icon
              return (
                <CommandItem key={entry.id} value={entry.id} onSelect={() => onSelect?.()}>
                  <Icon className="mr-2 h-4 w-4" />
                  {entry.label}
                  {entry.shortcut ? <CommandShortcut>{entry.shortcut}</CommandShortcut> : null}
                </CommandItem>
              )
            })}
          </CommandGroup>
        )
      })}
    </CommandList>
  )
}

export const CommandShowcase = () => {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const filteredCommands = useFuseSearch(COMMAND_PALETTE_ENTRIES, query, commandFuseOptions)

  const commandProps = {
    shouldFilter: false as const,
    value: query,
    onValueChange: setQuery,
  }

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Fuzzy search powered by{" "}
        <a
          href="https://www.fusejs.io/"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4"
        >
          Fuse.js
        </a>
        . Try typos like &quot;calender&quot; or &quot;profle&quot;.
      </p>
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => setOpen(true)}>
          <Search className="mr-2 h-4 w-4" /> Open command (
          <kbd className="ml-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
          )
        </Button>
      </div>
      <Command {...commandProps} className="rounded-lg border border-border shadow-sm">
        <CommandInput placeholder="Type a command…" />
        <CommandPaletteList entries={filteredCommands} />
      </Command>
      <CommandDialog open={open} onOpenChange={setOpen} commandProps={commandProps}>
        <CommandInput placeholder="Type a command…" />
        <CommandPaletteList entries={filteredCommands} onSelect={() => setOpen(false)} />
      </CommandDialog>
    </div>
  )
}
