import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

export type RegistryItemKind = "primitive" | "block"

export type RegistryFile = {
  path: string
  content: string
}

export type RegistryItem = {
  name: string
  kind: RegistryItemKind
  description: string
  dependencies: Record<string, string>
  registryDependencies: string[]
  files: RegistryFile[]
  /** Present when kind === "block" — consumers import from this specifier */
  import?: string
}

export type BlocksRegistry = {
  version: number
  generated?: string
  items: RegistryItem[]
}

const DEFAULT_BLOCKS_UI_RANGE = "^0.0.1"

export function getDefaultBlocksUiVersion(): string {
  const override = process.env.BLOCKS_UI_VERSION_OVERRIDE
  if (typeof override === "string" && override.length > 0) {
    return override
  }
  return DEFAULT_BLOCKS_UI_RANGE
}

/** `registry/registry.json` lives next to `dist/` inside the package. */
function getRegistryPath(): string {
  const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..")
  return join(packageRoot, "registry", "registry.json")
}

export function loadRegistrySync(): BlocksRegistry {
  const raw = readFileSync(getRegistryPath(), "utf8")
  return JSON.parse(raw) as BlocksRegistry
}

export function splitRegistry(reg: BlocksRegistry): {
  primitives: RegistryItem[]
  blocks: RegistryItem[]
} {
  const primitives = reg.items.filter((i) => i.kind === "primitive")
  const blocks = reg.items.filter((i) => i.kind === "block")
  return { primitives, blocks }
}

export function getRegistryItemMap(reg: BlocksRegistry): Map<string, RegistryItem> {
  return new Map(reg.items.map((i) => [i.name, i]))
}
