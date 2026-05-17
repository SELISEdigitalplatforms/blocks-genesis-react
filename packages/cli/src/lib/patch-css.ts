import { readFileSync, writeFileSync } from "node:fs"

const MARK_BEGIN = "/* --- @blocks/ui (cli) --- */"
const MARK_END = "/* --- end @blocks/ui --- */"
const SINGLE_LINE_MARKER = `@import "@blocks/ui/globals.css";`

/** Idempotent globals import into the main stylesheet. */
export function ensureGlobalsCssImport(cssPath: string, dryRun: boolean): boolean {
  const current = readFileSync(cssPath, "utf8")
  if (
    current.includes(SINGLE_LINE_MARKER) ||
    current.includes("@blocks/ui/globals.css") ||
    current.includes("@import \"@blocks/ui/globals.css\"")
  ) {
    return false
  }

  const block = `\n${MARK_BEGIN}\n@import "@blocks/ui/globals.css";\n${MARK_END}\n`
  const next = `${current.trimEnd()}${block}\n`

  if (dryRun) {
    console.info(`[dry-run] patch ${cssPath}`)
    return true
  }
  writeFileSync(cssPath, next, "utf8")
  return true
}
