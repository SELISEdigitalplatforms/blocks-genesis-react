import { spawnSync } from "node:child_process"
import { existsSync } from "node:fs"
import { join } from "node:path"

import type { ResolvedContext } from "./context.js"

export type PackageManager = "pnpm" | "npm" | "yarn"

export function detectPackageManager(ctx: ResolvedContext): PackageManager {
  if (existsSync(join(ctx.cwd, "pnpm-lock.yaml"))) return "pnpm"
  if (existsSync(join(ctx.cwd, "yarn.lock"))) return "yarn"
  return "npm"
}

export type InstallDepsArgs = ResolvedContext & {
  pm: PackageManager
  dev?: boolean
  packages: Record<string, string>
}

/** Merge version ranges: naive — keep existing pkg version if already present unless empty. */
export function mergeDepRanges(
  current: Record<string, string>,
  incoming: Record<string, string>,
): Record<string, string> {
  const next = { ...current }
  for (const [name, range] of Object.entries(incoming)) {
    if (!next[name]) {
      next[name] = range
    }
  }
  return next
}

export function runInstall(args: InstallDepsArgs): boolean {
  const entries = Object.entries(args.packages).filter(([n]) => n.length > 0)
  if (entries.length === 0) return true

  const specifiers = entries.map(([n, r]) =>
    // exact version pinning when range looks semver-exact-ish; else `@${range}`
    r.startsWith("^") || r.startsWith("~") || r.startsWith(">") ? `${n}@${r}` : `${n}@${r}`,
  )

  if (args.dryRun) {
    console.info(`[dry-run] ${args.pm} add ${specifiers.join(" ")}`)
    return true
  }

  switch (args.pm) {
    case "pnpm":
      return spawnPackageManager(args.cwd, ["add", ...(args.dev ? ["-D"] : []), ...specifiers], "pnpm")
    case "yarn":
      return spawnPackageManager(args.cwd, ["add", ...(args.dev ? ["-D"] : []), ...specifiers], "yarn")
    case "npm":
    default:
      return spawnPackageManager(
        args.cwd,
        ["install", ...(args.dev ? ["--save-dev"] : ["--save"]), ...specifiers],
        "npm",
      )
  }
}

export type RemoveDepsArgs = ResolvedContext & {
  pm: PackageManager
  packages: string[]
}

export function runRemove(args: RemoveDepsArgs): boolean {
  const names = args.packages.filter((n) => n.length > 0)
  if (names.length === 0) return true

  if (args.dryRun) {
    console.info(`[dry-run] ${args.pm} remove ${names.join(" ")}`)
    return true
  }

  switch (args.pm) {
    case "pnpm":
      return spawnPackageManager(args.cwd, ["remove", ...names], "pnpm")
    case "yarn":
      return spawnPackageManager(args.cwd, ["remove", ...names], "yarn")
    case "npm":
    default:
      return spawnPackageManager(args.cwd, ["uninstall", ...names], "npm")
  }
}

function spawnPackageManager(cwd: string, argv: string[], cmd: string): boolean {
  const r = spawnSync(cmd, argv, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  })
  return r.status === 0
}
