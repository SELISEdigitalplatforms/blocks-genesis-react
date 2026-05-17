import { readFileSync, writeFileSync } from "node:fs"

const MARK_BEGIN = "/* --- @blocks-kit/ui (cli) --- */"
const MARK_END = "/* --- end @blocks-kit/ui --- */"
const SINGLE_LINE_MARKER = `@import "@blocks-kit/ui/globals.css";`

/** Idempotent globals import into the main stylesheet. */
export function ensureGlobalsCssImport(cssPath: string, dryRun: boolean): boolean {
  const current = readFileSync(cssPath, "utf8")
  if (
    current.includes(SINGLE_LINE_MARKER) ||
    current.includes("@blocks-kit/ui/globals.css") ||
    current.includes("@import \"@blocks-kit/ui/globals.css\"")
  ) {
    return false
  }

  const block = `\n${MARK_BEGIN}\n@import "@blocks-kit/ui/globals.css";\n${MARK_END}\n`
  const next = `${current.trimEnd()}${block}\n`

  if (dryRun) {
    console.info(`[dry-run] patch ${cssPath}`)
    return true
  }
  writeFileSync(cssPath, next, "utf8")
  return true
}
