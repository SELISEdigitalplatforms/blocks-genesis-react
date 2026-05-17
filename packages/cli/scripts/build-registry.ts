/**
 * Generates registry/registry.json from @blocks-kit/ui component sources.
 * Run: pnpm build:registry (from packages/cli)
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))

const PACKAGES_ROOT = resolve(__dirname, "..", "..")
const UI_ROOT = join(PACKAGES_ROOT, "ui")
const UI_COMPONENTS = join(UI_ROOT, "src", "components")
const REGISTRY_OUT = join(__dirname, "..", "registry", "registry.json")

/** Curated blocks: stay as package imports; multi-file / composed widgets */
const BLOCK_NAMES = new Set([
  "copy-to-clipboard-button",
  "data-table",
  "file-uploader",
  "import-file-modal",
  "infinite-scroller",
  "kanban",
  "masked-text",
  "multi-select",
  "timeline",
  "wizard-stepper",
])

type UiManifest = {
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

function readUiDeps(): {
  deps: Record<string, string>
  peers: Record<string, string>
} {
  const raw = readFileSync(join(UI_ROOT, "package.json"), "utf8")
  const pkg = JSON.parse(raw) as UiManifest
  return {
    deps: { ...(pkg.dependencies ?? {}) },
    peers: { ...(pkg.peerDependencies ?? {}) },
  }
}

function collectSourceFiles(dir: string): string[] {
  const out: string[] = []
  const entries = readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const p = join(dir, e.name)
    if (e.isDirectory()) {
      out.push(...collectSourceFiles(p))
    } else if (e.isFile() && /\.(ts|tsx)$/.test(e.name) && !e.name.endsWith(".test.ts")) {
      out.push(p)
    }
  }
  return out
}

function extractImportSpecifiers(source: string): string[] {
  const specs: string[] = []
  let m: RegExpExecArray | null
  const re =
    /(?:import|export)\s+(?:type\s+)?(?:[\w*{}\s,$]+\s+from\s+)?["']([^"']+)["']/g
  while ((m = re.exec(source)) !== null) {
    const spec = m[1]
    if (spec) specs.push(spec)
  }
  return specs
}

function resolveRelativeImport(fromFile: string, spec: string): string | null {
  if (!spec.startsWith(".")) return null
  const resolved = resolve(dirname(fromFile), spec)
  const rel = relative(UI_COMPONENTS, resolved).replace(/\\/g, "/")
  const slash = rel.indexOf("/")
  if (slash === -1) return null
  return rel.slice(0, slash)
}

function parseBlocksUiComponentImport(spec: string): string | null {
  const prefix = "@blocks-kit/ui/components/"
  if (!spec.startsWith(prefix)) return null
  const rest = spec.slice(prefix.length)
  const slash = rest.indexOf("/")
  const name = slash === -1 ? rest : rest.slice(0, slash)
  return name.length > 0 ? name : null
}

function npmPackageName(spec: string): string {
  if (spec.startsWith("@")) {
    const parts = spec.split("/")
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : spec
  }
  const head = spec.split("/")[0]
  return head ?? spec
}

function resolvePackageVersion(
  pkgName: string,
  deps: Record<string, string>,
  peers: Record<string, string>,
): string | null {
  if (deps[pkgName]) return deps[pkgName]
  if (peers[pkgName]) return peers[pkgName]
  return null
}

function scanFileDeps(args: {
  fileAbs: string
  content: string
  selfName: string
  deps: Record<string, string>
  peers: Record<string, string>
  npmAcc: Map<string, string>
  registryAcc: Set<string>
}): void {
  const { fileAbs, content, selfName, deps, peers, npmAcc, registryAcc } = args
  for (const spec of extractImportSpecifiers(content)) {
    const blocksName = parseBlocksUiComponentImport(spec)
    if (blocksName && blocksName !== selfName) {
      registryAcc.add(blocksName)
      continue
    }
    const relTarget = resolveRelativeImport(fileAbs, spec)
    if (relTarget && relTarget !== selfName) {
      registryAcc.add(relTarget)
      continue
    }
    if (
      spec.startsWith(".") ||
      spec.startsWith("@blocks-kit/ui") ||
      spec.startsWith("node:")
    ) {
      continue
    }
    const pkgName = npmPackageName(spec)
    const ver = resolvePackageVersion(pkgName, deps, peers)
    if (ver) {
      npmAcc.set(pkgName, ver)
    }
  }
}

function buildItem(args: {
  name: string
  kind: "primitive" | "block"
  files: { path: string; content: string }[]
  deps: Record<string, string>
  peers: Record<string, string>
}): {
  name: string
  kind: "primitive" | "block"
  description: string
  dependencies: Record<string, string>
  registryDependencies: string[]
  files: { path: string; content: string }[]
  import?: string
} {
  const { name, kind, files } = args
  const npmAcc = new Map<string, string>()
  const registryAcc = new Set<string>()

  for (const f of files) {
    scanFileDeps({
      fileAbs: join(UI_COMPONENTS, name, f.path),
      content: f.content,
      selfName: name,
      deps: args.deps,
      peers: args.peers,
      npmAcc,
      registryAcc,
    })
  }

  registryAcc.delete(name)

  const dependencies = Object.fromEntries(
    Array.from(npmAcc.entries()).sort(([a], [b]) => a.localeCompare(b)),
  )
  const registryDependencies = Array.from(registryAcc).sort()

  const description =
    kind === "block"
      ? `Composed block — import from @blocks-kit/ui/components/${name}`
      : `Primitive — copied into your project under components/ui`

  const base = {
    name,
    kind,
    description,
    dependencies,
    registryDependencies,
    files: kind === "primitive" ? files : [],
  }

  if (kind === "block") {
    return { ...base, import: `@blocks-kit/ui/components/${name}` }
  }
  return base
}

function main(): void {
  const { deps, peers } = readUiDeps()
  const dirs = readdirSync(UI_COMPONENTS, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b))

  const items: ReturnType<typeof buildItem>[] = []

  for (const name of dirs) {
    const dir = join(UI_COMPONENTS, name)
    const sources = collectSourceFiles(dir)
    if (sources.length === 0) continue

    const files = sources
      .map((abs) => ({
        path: relative(dir, abs).replace(/\\/g, "/"),
        content: readFileSync(abs, "utf8"),
      }))
      .sort((a, b) => a.path.localeCompare(b.path))

    const kind: "primitive" | "block" = BLOCK_NAMES.has(name) ? "block" : "primitive"
    items.push(buildItem({ name, kind, files, deps, peers }))
  }

  const registry = {
    version: 2 as const,
    generated: new Date().toISOString(),
    items,
  }

  writeFileSync(REGISTRY_OUT, `${JSON.stringify(registry, null, 2)}\n`, "utf8")
  console.info(`Wrote ${REGISTRY_OUT} (${items.length} items)`)
}

main()
