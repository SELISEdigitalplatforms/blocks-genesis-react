import * as prompts from "@clack/prompts"

import { filterItemsByQuery } from "../lib/blocks-registry.js"
import type { ResolvedContext } from "../lib/context.js"
import { loadRegistrySync, splitRegistry } from "../registry/load-registry.js"

export type ListArgs = ResolvedContext & {
  kind?: string
  query?: string
}

export async function listCommand(opts: ListArgs): Promise<void> {
  const registry = loadRegistrySync()
  const kindFilter = (opts.kind ?? "all").toLowerCase()
  const query = opts.query?.trim() ?? ""

  let items = registry.items
  if (kindFilter === "primitive") {
    items = items.filter((i) => i.kind === "primitive")
  } else if (kindFilter === "block") {
    items = items.filter((i) => i.kind === "block")
  } else if (kindFilter !== "all") {
    prompts.log.error(`Invalid --kind "${opts.kind}". Use primitive | block | all.`)
    process.exitCode = 1
    return
  }

  if (query.length) {
    items = filterItemsByQuery(items, query)
  }

  const { primitives, blocks } = splitRegistry({ ...registry, items })

  const row = (name: string, kind: string, desc: string, depc: number) =>
    `  ${name.padEnd(28)} ${kind.padEnd(10)} deps:${String(depc).padStart(3)}  ${desc}`

  console.info("\nPrimitives")
  console.info("─".repeat(96))
  for (const p of primitives.sort((a, b) => a.name.localeCompare(b.name))) {
    console.info(row(p.name, p.kind, p.description, Object.keys(p.dependencies).length))
  }

  console.info("\nBlocks (package import)")
  console.info("─".repeat(96))
  for (const b of blocks.sort((a, b) => a.name.localeCompare(b.name))) {
    console.info(row(b.name, b.kind, b.description, Object.keys(b.dependencies).length))
  }

  console.info(`\nTotal: ${items.length} shown\n`)
}
