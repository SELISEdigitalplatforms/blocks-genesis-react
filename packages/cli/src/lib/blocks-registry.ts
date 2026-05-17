import { existsSync } from "node:fs"

import Fuse from "fuse.js"

import type { RegistryItem } from "../registry/load-registry.js"

export function filterItemsByQuery(all: RegistryItem[], query: string): RegistryItem[] {
  const q = query.trim()
  if (!q.length) return all

  const fuse = new Fuse(all, {
    keys: ["name", "description"],
    threshold: 0.42,
    includeScore: false,
  })
  return fuse.search(q).map((r) => r.item)
}

export function validateItemNames(items: RegistryItem[], names: string[]): string[] | null {
  const known = new Set(items.map((i) => i.name))
  const missing = names.filter((n) => !known.has(n))
  return missing.length ? missing : null
}

export function aggregateDeps(selected: RegistryItem[]): Record<string, string> {
  const acc: Record<string, string> = {}
  for (const item of selected) {
    for (const [k, v] of Object.entries(item.dependencies ?? {})) {
      if (!acc[k]) acc[k] = v
    }
  }
  return acc
}

export function expandRegistryDependencies(
  names: string[],
  itemByName: Map<string, RegistryItem>,
): string[] {
  const out = new Set<string>()
  const q = [...names]
  while (q.length) {
    const n = q.shift()
    if (!n || out.has(n)) continue
    out.add(n)
    const item = itemByName.get(n)
    if (!item) continue
    for (const dep of item.registryDependencies) {
      if (!out.has(dep)) q.push(dep)
    }
  }
  return Array.from(out)
}

export function workspaceHasBlocksUi(cwd: string): boolean {
  const dir = `${cwd}/node_modules/@blocks-kit/ui`
  return existsSync(dir)
}
