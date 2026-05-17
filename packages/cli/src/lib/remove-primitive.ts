import { existsSync, readdirSync, rmSync, statSync } from "node:fs"
import { join } from "node:path"

import type { RegistryItem } from "../registry/load-registry.js"

export function listInstalledPrimitiveNames(
  destRoot: string,
  primitiveNames: Set<string>,
): string[] {
  if (!existsSync(destRoot)) return []

  const installed: string[] = []
  for (const entry of readdirSync(destRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    if (primitiveNames.has(entry.name)) {
      installed.push(entry.name)
    }
  }
  return installed.sort((a, b) => a.localeCompare(b))
}

export type RemovePrimitiveResult = {
  name: string
  removed: boolean
  path: string
}

export function removePrimitiveDir(args: {
  destRoot: string
  name: string
  dryRun: boolean
}): RemovePrimitiveResult {
  const path = join(args.destRoot, args.name)
  if (!existsSync(path)) {
    return { name: args.name, removed: false, path }
  }

  try {
    if (!statSync(path).isDirectory()) {
      return { name: args.name, removed: false, path }
    }
  } catch {
    return { name: args.name, removed: false, path }
  }

  if (args.dryRun) {
    console.info(`[dry-run] rm -rf ${path}`)
    return { name: args.name, removed: true, path }
  }

  rmSync(path, { recursive: true, force: true })
  return { name: args.name, removed: true, path }
}

/** Deps still required by primitives that remain on disk under destRoot. */
export function aggregateDepsForInstalledPrimitives(args: {
  destRoot: string
  primitiveItems: RegistryItem[]
}): Record<string, string> {
  const installed = new Set(
    listInstalledPrimitiveNames(
      args.destRoot,
      new Set(args.primitiveItems.map((p) => p.name)),
    ),
  )

  const acc: Record<string, string> = {}
  for (const item of args.primitiveItems) {
    if (!installed.has(item.name)) continue
    for (const [k, v] of Object.entries(item.dependencies ?? {})) {
      if (!acc[k]) acc[k] = v
    }
  }
  return acc
}
