import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

import * as prompts from "@clack/prompts"
import { parse } from "tsconfck"

import { workspaceHasBlocksUi } from "../lib/blocks-registry.js"
import { readComponentsJson } from "../lib/components-json.js"
import type { ResolvedContext } from "../lib/context.js"
import { mapAliasImportToDir } from "../lib/copy-primitive.js"
import { detectFramework, resolveCssCandidates } from "../lib/framework.js"

function readPackageDeps(cwd: string): Record<string, string> {
  try {
    const raw = readFileSync(join(cwd, "package.json"), "utf8")
    const pkg = JSON.parse(raw) as {
      dependencies?: Record<string, string>
      devDependencies?: Record<string, string>
    }
    return { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) }
  } catch {
    return {}
  }
}

function parseReactMajor(v: string | undefined): number | null {
  if (!v) return null
  const m = v.match(/(\d+)/)
  return m ? Number(m[1]) : null
}

function cssHasBlocksImport(cwd: string, fw: ReturnType<typeof detectFramework>): boolean {
  const paths = resolveCssCandidates(cwd, fw)
  for (const p of paths) {
    try {
      const txt = readFileSync(p, "utf8")
      if (txt.includes("@blocks-kit/ui/globals.css")) return true
    } catch {
      /* skip */
    }
  }
  try {
    /** root scan */
    const rootCss = join(cwd, "globals.css")
    if (existsSync(rootCss) && readFileSync(rootCss, "utf8").includes("@blocks-kit/ui/globals.css")) {
      return true
    }
  } catch {
    /* skip */
  }
  return false
}

export async function doctorCommand(opts: ResolvedContext): Promise<void> {
  let issues = 0
  const cwd = opts.cwd

  if (!existsSync(join(cwd, "package.json"))) {
    prompts.log.error("No package.json — not a Node project root")
    process.exitCode = 1
    return
  }

  const deps = readPackageDeps(cwd)
  const react = deps.react
  const maj = parseReactMajor(react)
  if (maj !== null && maj < 19) {
    prompts.log.warn(
      `react@${react} — @blocks-kit/ui expects React 19+ (peer ^19). Upgrade React or expect breakage.`,
    )
    issues += 1
  }

  if (!deps["@blocks-kit/ui"] && !workspaceHasBlocksUi(cwd)) {
    prompts.log.error(
      "Missing @blocks-kit/ui dependency and no node_modules/@blocks-kit/ui — run `blocks init`",
    )
    issues += 2
  }

  const fw = detectFramework(cwd)
  if (fw === "unknown") {
    prompts.log.warn("Could not detect vite/next — ensure stack is standard")
    issues += 1
  }

  if (fw !== "unknown" && !cssHasBlocksImport(cwd, fw)) {
    prompts.log.warn('No @import "@blocks-kit/ui/globals.css" found in common CSS entries')
    issues += 1
  }

  const cj = readComponentsJson(cwd)
  if (!cj) {
    prompts.log.warn("No components.json — run `blocks init` for shadcn-style aliases")
    issues += 1
  } else {
    const mode = cj.blocks?.defaultMode
    const okModes = ["light", "dark", "system"] as const
    if (mode && !(okModes as readonly string[]).includes(mode)) {
      prompts.log.warn(`components.json blocks.defaultMode="${mode}" — expected light | dark | system`)
      issues += 1
    }

    const aliasUi = cj.aliases?.ui
    if (!aliasUi) {
      prompts.log.warn("components.json missing aliases.ui — run `blocks init`")
      issues += 1
    } else {
      let paths: Record<string, string[]> | undefined
      try {
        const result = await parse(join(cwd, "tsconfig.json"), { root: cwd })
        paths = result.tsconfig?.compilerOptions?.paths as Record<string, string[]> | undefined
      } catch {
        paths = undefined
      }
      const mapped = mapAliasImportToDir(aliasUi, paths, cwd)
      if (!mapped || !existsSync(mapped)) {
        prompts.log.warn(
          `aliases.ui "${aliasUi}" does not resolve to an existing directory — create it or fix tsconfig paths`,
        )
        issues += 1
      }
    }
  }

  if (issues === 0) prompts.log.success("Doctor: OK")
  else process.exitCode = 1
}
