import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"

import { parse } from "tsconfck"

import type { RegistryItem } from "../registry/load-registry.js"

/** Map tsconfig paths pattern → absolute directory for an alias import like `@/components/ui`. */
export function mapAliasImportToDir(
  aliasImport: string,
  paths: Record<string, string[]> | undefined,
  cwd: string,
): string | null {
  if (!paths) return null

  const entries = Object.entries(paths).sort((a, b) => b[0].length - a[0].length)

  for (const [pattern, targets] of entries) {
    const t0 = targets[0]
    if (!t0) continue

    const starIdx = pattern.indexOf("*")
    if (starIdx === -1) {
      if (aliasImport === pattern) {
        return join(cwd, t0)
      }
      continue
    }

    const prefix = pattern.slice(0, starIdx)
    const patternSuffix = pattern.slice(starIdx + 1)

    if (!aliasImport.startsWith(prefix)) continue
    if (patternSuffix && !aliasImport.endsWith(patternSuffix)) continue

    const dynamicPart = aliasImport.slice(
      prefix.length,
      patternSuffix ? aliasImport.length - patternSuffix.length : undefined,
    )

    const mapStar = t0.indexOf("*")
    if (mapStar === -1) {
      return join(cwd, t0)
    }

    const mapPrefix = t0.slice(0, mapStar)
    const mapSuffix = t0.slice(mapStar + 1)
    const rel = `${mapPrefix}${dynamicPart}${mapSuffix}`
    return join(cwd, rel)
  }

  return null
}

export async function resolveAliasUiRoot(cwd: string, aliasUi: string): Promise<string> {
  let paths: Record<string, string[]> | undefined
  try {
    const tsconfigPath = join(cwd, "tsconfig.json")
    const result = await parse(tsconfigPath, { root: cwd })
    paths = result.tsconfig?.compilerOptions?.paths as Record<string, string[]> | undefined
  } catch {
    paths = undefined
  }
  const mapped = mapAliasImportToDir(aliasUi, paths, cwd)
  if (mapped) return mapped

  /** Fallback when no tsconfig paths — mirrors common Vite / Next layouts */
  const hasAppDir = existsSync(join(cwd, "app"))
  const hasSrcApp = existsSync(join(cwd, "src", "app"))
  if (hasAppDir || hasSrcApp) {
    return join(cwd, "components", "ui")
  }

  return join(cwd, "src", "components", "ui")
}

export function rewriteBlocksUiImports(
  source: string,
  installedNames: Set<string>,
  aliasUiPrefix: string,
): string {
  const re = /@blocks\/ui\/components\/([^"'`\s]+)/g
  return source.replace(re, (_full, rawPath: string) => {
    const firstSegment = rawPath.split("/")[0]
    if (!firstSegment || !installedNames.has(firstSegment)) {
      return `@blocks-kit/ui/components/${rawPath}`
    }
    const rest = rawPath.slice(firstSegment.length)
    const suffix = rest.startsWith("/") ? rest : ""
    return `${aliasUiPrefix}/${firstSegment}${suffix}`
  })
}

export type CopyPrimitiveResult = {
  name: string
  wrote: string[]
  skipped: string[]
}

export function copyPrimitiveFiles(args: {
  item: RegistryItem
  destRoot: string
  installedNames: Set<string>
  aliasUiPrefix: string
  dryRun: boolean
  overwrite: boolean
}): CopyPrimitiveResult {
  const { item, destRoot, installedNames, aliasUiPrefix, dryRun, overwrite } = args
  const wrote: string[] = []
  const skipped: string[] = []

  if (!item.files.length) {
    return { name: item.name, wrote, skipped }
  }

  const primDir = join(destRoot, item.name)

  for (const file of item.files) {
    const outPath = join(primDir, file.path)
    const nextContent = rewriteBlocksUiImports(file.content, installedNames, aliasUiPrefix)

    if (!overwrite && existsSync(outPath)) {
      skipped.push(outPath)
      continue
    }

    if (dryRun) {
      console.info(`[dry-run] write ${outPath}`)
      wrote.push(outPath)
      continue
    }

    mkdirSync(dirname(outPath), { recursive: true })
    writeFileSync(outPath, nextContent, "utf8")
    wrote.push(outPath)
  }

  return { name: item.name, wrote, skipped }
}
