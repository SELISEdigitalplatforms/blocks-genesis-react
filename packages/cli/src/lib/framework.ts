import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

export type Framework = "vite" | "next" | "unknown"

export function detectFramework(cwd: string): Framework {
  const pjPath = join(cwd, "package.json")
  if (!existsSync(pjPath)) return "unknown"
  try {
    const pkg = JSON.parse(readFileSync(pjPath, "utf8")) as {
      dependencies?: Record<string, string>
      devDependencies?: Record<string, string>
    }
    const deps = { ...pkg.dependencies, ...pkg.devDependencies }
    if (deps?.next) return "next"
    if (deps?.vite || existsSync(join(cwd, "vite.config.ts")) || existsSync(join(cwd, "vite.config.js"))) {
      return "vite"
    }
    return "unknown"
  } catch {
    return "unknown"
  }
}

/** Best-effort Tailwind/CSS entry paths for patching. */
export function resolveCssCandidates(cwd: string, fx: Framework): string[] {
  const candidates =
    fx === "next"
      ? [
          join(cwd, "app", "globals.css"),
          join(cwd, "src", "app", "globals.css"),
          join(cwd, "styles", "globals.css"),
        ]
      : [
          join(cwd, "src", "index.css"),
          join(cwd, "src", "styles", "globals.css"),
          join(cwd, "src", "main.css"),
        ]

  return candidates.filter((p) => existsSync(p))
}
