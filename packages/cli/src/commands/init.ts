import { existsSync } from "node:fs"
import { join, relative } from "node:path"

import * as prompts from "@clack/prompts"

import type { ResolvedContext } from "../lib/context.js"
import { readPackageJson } from "../lib/read-package-json.js"
import {
  detectFramework,
  resolveCssCandidates,
  type Framework,
} from "../lib/framework.js"
import {
  detectPackageManager,
  runInstall,
  type PackageManager,
} from "../lib/pm.js"
import {
  buildComponentsJson,
  writeComponentsJson,
  type ComponentsJsonBlocks,
} from "../lib/components-json.js"
import { ensureGlobalsCssImport } from "../lib/patch-css.js"

import { getDefaultBlocksUiVersion } from "../registry/load-registry.js"

const BASE_COLORS = ["slate", "zinc", "neutral", "stone", "gray"] as const

const DEFAULT_MODES = ["light", "dark", "system"] as const

export type InitArgs = ResolvedContext & {
  yes?: boolean
  template?: Framework
  theme?: string
  defaultMode?: ComponentsJsonBlocks["defaultMode"]
  pm?: PackageManager
}

export async function initCommand(opts: InitArgs): Promise<void> {
  const cwd = opts.cwd
  const yes = opts.yes === true || process.env.BLOCKS_CLI_YES === "1"

  if (!existsSync(join(cwd, "package.json"))) {
    prompts.log.error(`No package.json under ${cwd}. Scaffold Vite/Next app first.`)
    process.exitCode = 1
    return
  }

  let pkgDeps: Record<string, string> = {}
  try {
    const pj = readPackageJson(cwd)
    pkgDeps = { ...(pj.dependencies ?? {}), ...(pj.devDependencies ?? {}) }
  } catch {
    prompts.log.error(`Could not read package.json under ${cwd}`)
    process.exitCode = 1
    return
  }

  if (!pkgDeps.react) {
    prompts.log.error(
      "blocks init is React-only — add `react` (and `react-dom`) to dependencies first.",
    )
    process.exitCode = 1
    return
  }

  let template: Exclude<Framework, "unknown"> | undefined =
    opts.template && opts.template !== "unknown" ? opts.template : undefined
  if (!template && !yes) {
    const t = await prompts.select({
      message: "App stack",
      options: [
        { value: "vite", label: "Vite + React" },
        { value: "next", label: "Next.js" },
      ],
    })
    if (prompts.isCancel(t)) {
      prompts.cancel("Canceled")
      return
    }
    template = t as Exclude<Framework, "unknown">
  }

  const detected = detectFramework(cwd)
  const framework: Exclude<Framework, "unknown"> =
    template ?? (detected !== "unknown" ? detected : "vite")

  let baseColor =
    opts.theme && BASE_COLORS.includes(opts.theme as (typeof BASE_COLORS)[number])
      ? opts.theme
      : yes
        ? "slate"
        : ""

  if (!baseColor && !yes) {
    const c = await prompts.select({
      message: "Default theme (tailwind baseColor)",
      options: [...BASE_COLORS].map((b) => ({ value: b, label: b })),
      initialValue: "slate",
    })
    if (prompts.isCancel(c)) {
      prompts.cancel("Canceled")
      return
    }
    baseColor = c as string
  }
  baseColor ||= "slate"

  let defaultMode: ComponentsJsonBlocks["defaultMode"]

  if (
    opts.defaultMode &&
    (DEFAULT_MODES as readonly string[]).includes(opts.defaultMode)
  ) {
    defaultMode = opts.defaultMode
  } else if (yes) {
    defaultMode = "system"
  } else {
    const m = await prompts.select({
      message: "Default color mode (next-themes)",
      options: [
        { value: "system", label: "system (follow OS)" },
        { value: "light", label: "light" },
        { value: "dark", label: "dark" },
      ],
      initialValue: "system",
    })
    if (prompts.isCancel(m)) {
      prompts.cancel("Canceled")
      return
    }
    defaultMode = m as ComponentsJsonBlocks["defaultMode"]
  }

  let pm: PackageManager = opts.pm ?? detectPackageManager(opts)
  if (!yes && !opts.pm) {
    const pkg = await prompts.select({
      message: "Package manager",
      options: [
        { value: "pnpm", label: "pnpm" },
        { value: "npm", label: "npm" },
        { value: "yarn", label: "yarn" },
      ],
      initialValue: pm,
    })
    if (prompts.isCancel(pkg)) {
      prompts.cancel("Canceled")
      return
    }
    pm = pkg as PackageManager
  }

  prompts.log.success(
    `blocks init → fw=${framework} theme=${baseColor} mode=${defaultMode} pm=${pm}`,
  )

  const cssCandidates = resolveCssCandidates(cwd, framework)

  /** Relative path written into components.json (posix). */
  let cssRelative: string

  /** Absolute path patched on disk when file exists */
  let cssAbs: string | null = cssCandidates[0] ?? null

  if (!cssAbs) {
    cssAbs =
      framework === "next" ? join(cwd, "app", "globals.css") : join(cwd, "src", "index.css")
    cssRelative = framework === "next" ? "app/globals.css" : "src/index.css"
    prompts.log.warn(
      `Missing CSS entry. components.json css → ${cssRelative}. Create ${cssRelative} before dev if needed.`,
    )
  } else {
    cssRelative = relative(cwd, cssAbs).split("\\").join("/")
  }

  const componentsBody = buildComponentsJson({
    framework,
    baseColor,
    cssRelativePath: cssRelative.startsWith(".") ? cssRelative : `./${cssRelative}`,
    defaultMode,
  })

  writeComponentsJson(cwd, componentsBody, opts.dryRun)

  if (cssCandidates.length > 0) {
    const entry = cssCandidates[0]
    if (entry) {
      const changed = ensureGlobalsCssImport(entry, opts.dryRun)
      if (changed && !opts.dryRun) {
        prompts.log.success(`Patched globals import → ${relative(cwd, entry)}`)
      }
    }
  }

  const okInstall = runInstall({
    cwd: opts.cwd,
    dryRun: opts.dryRun,
    pm,
    packages: { "@blocks-kit/ui": getDefaultBlocksUiVersion() },
  })

  if (!okInstall) process.exitCode = 1

  prompts.log.info(`Wrap your app with next-themes ThemeProvider, for example:`)
  prompts.log.message(`\
import { ThemeProvider } from "next-themes"

<ThemeProvider attribute="class" defaultTheme="${defaultMode}" enableSystem>
  {children}
</ThemeProvider>`)
  prompts.log.info(`Primitives install with: blocks add <name>. Blocks stay on @blocks-kit/ui.`)
}
