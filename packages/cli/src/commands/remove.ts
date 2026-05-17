import * as prompts from "@clack/prompts"

import { aggregateDeps, validateItemNames } from "../lib/blocks-registry.js"
import { readComponentsJson } from "../lib/components-json.js"
import type { ResolvedContext } from "../lib/context.js"
import { resolveAliasUiRoot } from "../lib/copy-primitive.js"
import {
  detectPackageManager,
  runRemove,
  type PackageManager,
} from "../lib/pm.js"
import {
  aggregateDepsForInstalledPrimitives,
  listInstalledPrimitiveNames,
  removePrimitiveDir,
} from "../lib/remove-primitive.js"
import { readPackageJson } from "../lib/read-package-json.js"
import {
  getRegistryItemMap,
  loadRegistrySync,
  splitRegistry,
  type RegistryItem,
} from "../registry/load-registry.js"

const SELECT_ALL = "__select_all__"
const NEVER_PRUNE = new Set(["@blocks/ui", "react", "react-dom"])

export type RemoveArgs = ResolvedContext & {
  yes?: boolean
  components?: string[]
  all?: boolean
  pruneDeps?: boolean
  pm?: PackageManager
}

function computePrunablePackages(args: {
  removedItems: RegistryItem[]
  destRoot: string
  primitiveItems: RegistryItem[]
  cwd: string
}): string[] {
  const removedDeps = aggregateDeps(args.removedItems)
  const stillNeeded = aggregateDepsForInstalledPrimitives({
    destRoot: args.destRoot,
    primitiveItems: args.primitiveItems,
  })

  const pkg = readPackageJson(args.cwd)
  const installed = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) }

  const candidates: string[] = []
  for (const name of Object.keys(removedDeps)) {
    if (NEVER_PRUNE.has(name)) continue
    if (stillNeeded[name]) continue
    if (!installed[name]) continue
    candidates.push(name)
  }

  return candidates.sort((a, b) => a.localeCompare(b))
}

export async function removeCommand(opts: RemoveArgs): Promise<void> {
  const yes = opts.yes === true || process.env.BLOCKS_CLI_YES === "1"
  const registry = loadRegistrySync()
  const { primitives } = splitRegistry(registry)
  const itemByName = getRegistryItemMap(registry)
  const primitiveNameSet = new Set(primitives.map((p) => p.name))

  const componentsJson = readComponentsJson(opts.cwd)
  if (!componentsJson) {
    prompts.log.error("No components.json — run `blocks init` first.")
    process.exitCode = 1
    return
  }

  const aliasUi = componentsJson.aliases?.ui ?? "@/components/ui"
  const destRoot = await resolveAliasUiRoot(opts.cwd, aliasUi)
  const installedPrimitives = listInstalledPrimitiveNames(destRoot, primitiveNameSet)

  let selectedNames: string[] = []

  if (opts.all === true) {
    selectedNames = [...installedPrimitives]
    if (selectedNames.length === 0) {
      prompts.log.warn(`No copied primitives under ${destRoot}. Nothing to remove.`)
      return
    }
  } else if (opts.components?.length) {
    selectedNames = [...opts.components]
  }

  if (selectedNames.length === 0 && !yes) {
    if (installedPrimitives.length === 0) {
      prompts.log.warn(`No copied primitives under ${destRoot}. Nothing to remove.`)
      return
    }

    const q = await prompts.text({
      message: "Search installed components to remove",
      placeholder: "button, card, …",
      initialValue: "",
    })
    if (prompts.isCancel(q)) {
      prompts.cancel("Canceled")
      return
    }

    const query = (q ?? "").trim().toLowerCase()
    const pool = installedPrimitives.filter(
      (n) => !query.length || n.includes(query) || n.startsWith(query),
    )

    const choices = await prompts.multiselect({
      message: "Pick components to remove",
      options: [
        { value: SELECT_ALL, label: "★ Select all installed" },
        ...pool.map((name) => {
          const kind = itemByName.get(name)?.kind ?? "unknown"
          return { value: name, label: `${name} — ${kind}` }
        }),
      ],
      required: false,
    })
    if (prompts.isCancel(choices)) {
      prompts.cancel("Canceled")
      return
    }
    const picked = choices as string[]
    selectedNames = picked.includes(SELECT_ALL) ? [...installedPrimitives] : picked
  }

  if (selectedNames.length === 0 && yes) {
    prompts.log.warn("No components passed. Example: blocks remove button card")
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

  const removedItems = selectedNames
    .map((n) => itemByName.get(n))
    .filter(Boolean) as RegistryItem[]

  prompts.log.message(`alias ui → ${aliasUi}`)
  prompts.log.message(`remove root → ${destRoot}`)

  let removedCount = 0
  for (const name of selectedNames) {
    const item = itemByName.get(name)
    if (!item) continue

    if (item.kind === "block") {
      prompts.log.info(
        `${name}: block — no files on disk (import from ${item.import ?? "@blocks/ui/components/" + name}). Stop using the import in your app.`,
      )
      continue
    }

    const res = removePrimitiveDir({ destRoot, name, dryRun: opts.dryRun })
    if (res.removed) {
      removedCount += 1
      prompts.log.success(
        `${name}: ${opts.dryRun ? "would remove" : "removed"} → ${res.path}`,
      )
    } else {
      prompts.log.warn(`${name}: not found under ${destRoot}`)
    }
  }

  if (opts.pruneDeps === true) {
    const prunable = computePrunablePackages({
      removedItems,
      destRoot,
      primitiveItems: primitives,
      cwd: opts.cwd,
    })

    if (prunable.length === 0) {
      prompts.log.info("No exclusive dependencies to prune.")
    } else {
      const pm = opts.pm ?? detectPackageManager(opts)
      const ok = runRemove({
        cwd: opts.cwd,
        dryRun: opts.dryRun,
        pm,
        packages: prunable,
      })
      if (!ok) process.exitCode = 1
      else if (!opts.dryRun) {
        prompts.log.success(`Pruned dependencies: ${prunable.join(", ")}`)
      }
    }
  } else if (removedItems.some((i) => Object.keys(i.dependencies).length > 0)) {
    prompts.log.info(
      "Dependencies were not removed. Re-run with `--prune-deps` to uninstall packages only used by removed components.",
    )
  }

  if (removedCount > 0 || removedItems.some((i) => i.kind === "block")) {
    prompts.log.success(`blocks remove → [${selectedNames.join(", ")}]`)
  }
}
