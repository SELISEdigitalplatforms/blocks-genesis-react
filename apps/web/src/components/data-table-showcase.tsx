import * as React from "react"

import { Badge } from "@blocks-kit/ui/components/badge"
import {
  BlocksDataTable,
  createBlocksColumnHelper,
  DataTableColumnHeader,
  DataTableGlobalSearch,
  DataTableRowActions,
  DataTableToolbar,
} from "@blocks-kit/ui/components/data-table"
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@blocks-kit/ui/components/dropdown-menu"

type TranslationRow = {
  key: string
  module: string
  english: string
}

const SAMPLE_ROWS: TranslationRow[] = [
  { key: "ABOUT", module: "common", english: "About" },
  { key: "ACCOUNT_SECURITY", module: "auth", english: "Account security" },
  { key: "ADD_USER", module: "auth", english: "Add user" },
  { key: "CALENDAR_TITLE", module: "common", english: "Calendar" },
  { key: "DASHBOARD_WELCOME", module: "common", english: "Welcome back" },
  { key: "EMAIL_PLACEHOLDER", module: "profile", english: "Enter your email" },
  { key: "MISSING_TRANSLATION", module: "localization", english: "Missing translation" },
  { key: "MODULE_SETTINGS", module: "settings", english: "Module settings" },
  { key: "PROFILE_AVATAR", module: "profile", english: "Profile avatar" },
  { key: "SAVE_CHANGES", module: "common", english: "Save changes" },
  { key: "SEARCH_KEYS", module: "localization", english: "Search translation keys" },
  { key: "USER_ROLES", module: "auth", english: "User roles" },
]

const columnHelper = createBlocksColumnHelper<TranslationRow>()

export const DataTableShowcase = () => {
  const [globalSearch, setGlobalSearch] = React.useState("")

  const columns = React.useMemo(
    () => [
      columnHelper.accessor("key", {
        header: ({ column }) => <DataTableColumnHeader column={column} title="Key" />,
        meta: { searchKeys: ["key"] },
        cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
      }),
      columnHelper.accessor("module", {
        header: ({ column }) => <DataTableColumnHeader column={column} title="Module" />,
        meta: { searchKeys: ["module"] },
        cell: (info) => (
          <Badge variant="secondary" className="font-normal">
            {info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor("english", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="English (Default)" />
        ),
        meta: { searchKeys: ["english"] },
      }),
      columnHelper.display({
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: () => (
          <DataTableRowActions>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DataTableRowActions>
        ),
      }),
    ],
    [],
  )

  return (
    <BlocksDataTable
      data={SAMPLE_ROWS}
      columns={columns}
      showColumnSearchRow
      globalSearch={globalSearch}
      onGlobalSearchChange={setGlobalSearch}
      fuseGlobal={{ keys: ["key", "module", "english"], debounceMs: 250 }}
      toolbar={
        <DataTableToolbar>
          <DataTableGlobalSearch
            value={globalSearch}
            onChange={setGlobalSearch}
            placeholder="Search all columns…"
          />
        </DataTableToolbar>
      }
    />
  )
}
