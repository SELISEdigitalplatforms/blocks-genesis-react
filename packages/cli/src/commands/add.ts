import * as prompts from "@clack/prompts"

import {
  aggregateDeps,
  expandRegistryDependencies,
  filterItemsByQuery,
  validateItemNames,
} from "../lib/blocks-registry.js"
import { readComponentsJson } from "../lib/components-json.js"
import type { ResolvedContext } from "../lib/context.js"
import { copyPrimitiveFiles, resolveAliasUiRoot } from "../lib/copy-primitive.js"
import {
  detectPackageManager,
  runInstall,
  type PackageManager,
} from "../lib/pm.js"
import {
  getDefaultBlocksUiVersion,
  getRegistryItemMap,
  loadRegistrySync,
  type RegistryItem,
} from "../registry/load-registry.js"

const SELECT_ALL = "__select_all__"

export type AddArgs = ResolvedContext & {
  yes?: boolean
  components?: string[]
  all?: boolean
  overwrite?: boolean
  pm?: PackageManager
}

function topoPrimitiveOrder(primitiveNames: string[], itemByName: Map<string, RegistryItem>): string[] {
  const primSet = new Set(primitiveNames)
  const ordered: string[] = []
  const done = new Set<string>()
  const visiting = new Set<string>()

  const visit = (n: string): void => {
    if (!primSet.has(n) || done.has(n)) return
    if (visiting.has(n)) return
    visiting.add(n)
    const item = itemByName.get(n)
    if (item?.kind === "primitive") {
      for (const d of item.registryDependencies) {
        if (primSet.has(d)) visit(d)
      }
    }
    visiting.delete(n)
    done.add(n)
    ordered.push(n)
  }

  for (const n of [...primitiveNames].sort((a, b) => a.localeCompare(b))) {
    visit(n)
  }

  return ordered
}

export async function addCommand(opts: AddArgs): Promise<void> {
  const yes = opts.yes === true || process.env.BLOCKS_CLI_YES === "1"
  const registry = loadRegistrySync()
  const itemByName = getRegistryItemMap(registry)
  const allNames = registry.items.map((i) => i.name)

  let selectedNames: string[] = []

  if (opts.all === true) {
    selectedNames = [...allNames]
  } else if (opts.components?.length) {
    selectedNames = [...opts.components]
  }

  if (selectedNames.length === 0 && !yes) {
    const q = await prompts.text({
      message: "Search components (name or description)",
      placeholder: "button, data-table, …",
      initialValue: "",
    })
    if (prompts.isCancel(q)) {
      prompts.cancel("Canceled")
      return
    }

    const pool = filterItemsByQuery(registry.items, q ?? "")
    const choices = await prompts.multiselect({
      message: "Pick components / blocks (deps merged)",
      options: [
        { value: SELECT_ALL, label: "★ Select all" },
        ...pool.map((item) => ({
          value: item.name,
          label: `${item.name} — ${item.kind}`,
        })),
      ],
      required: false,
    })
    if (prompts.isCancel(choices)) {
      prompts.cancel("Canceled")
      return
    }
    const picked = choices as string[]
    selectedNames = picked.includes(SELECT_ALL) ? [...allNames] : picked
  }

  if (selectedNames.length === 0 && yes) {
    prompts.log.warn("No components passed. Example: blocks add button card")
    return
  }

  if (selectedNames.length === 0) {
    prompts.log.warn("No components selected.")
    return
  }

  const missing = validateItemNames(registry.items, selectedNames)
  if (missing) {
    prompts.log.error(`Unknown name(s): ${missing.join(", ")}`)
    process.exitCode = 1
    return
  }

  const expanded = expandRegistryDependencies(selectedNames, itemByName)

  const expandedItems = expanded.map((n) => itemByName.get(n)).filter(Boolean) as RegistryItem[]
  const primitiveExpanded = expanded.filter((n) => itemByName.get(n)?.kind === "primitive")

  const componentsJson = readComponentsJson(opts.cwd)
  const aliasUi = componentsJson?.aliases?.ui ?? "@/components/ui"
  const destRoot = await resolveAliasUiRoot(opts.cwd, aliasUi)
  const installedPrimitiveNames = new Set(primitiveExpanded)

  const pm: PackageManager = opts.pm ?? detectPackageManager(opts)

  prompts.log.message(`alias ui → ${aliasUi}`)
  prompts.log.message(`copy root → ${destRoot}`)

  const primOrder = topoPrimitiveOrder(primitiveExpanded, itemByName)
  for (const name of primOrder) {
    const item = itemByName.get(name)
    if (!item || item.kind !== "primitive") continue
    const res = copyPrimitiveFiles({
      item,
      destRoot,
      installedNames: installedPrimitiveNames,
      aliasUiPrefix: aliasUi,
      dryRun: opts.dryRun,
      overwrite: opts.overwrite === true,
    })
    if (res.skipped.length) {
      prompts.log.warn(`${name}: skipped (exists) → ${res.skipped.length} file(s). Use --overwrite.`)
    }
    if (res.wrote.length) {
      prompts.log.success(`${name}: primitive → ${opts.dryRun ? "would write" : "wrote"} ${res.wrote.length} file(s)`)
    }
  }

  for (const name of expanded) {
    const item = itemByName.get(name)
    if (item?.kind === "block") {
      prompts.log.info(`${name}: block → keep importing from ${item.import ?? "@blocks/ui/components/" + name}`)
    }
  }

  const deps = aggregateDeps(expandedItems)
  const packages: Record<string, string> = {
    "@blocks/ui": getDefaultBlocksUiVersion(),
    ...deps,
  }

  const ok = runInstall({
    cwd: opts.cwd,
    dryRun: opts.dryRun,
    pm,
    packages,
  })

  if (!ok) process.exitCode = 1
  else prompts.log.success(`blocks add → [${expanded.join(", ")}]`)
}
