/**
 * Smoke-test built CLI against a temp copy of apps/web.
 * init/add stay dry-run; remove uses seeded primitive folders (add dry-run writes nothing).
 */
import { spawnSync } from "node:child_process"
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, sep } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = fileURLToPath(new URL(".", import.meta.url))
const repoRoot = join(__dirname, "..", "..", "..")
const webApp = join(repoRoot, "apps", "web")
const cliJs = join(__dirname, "..", "dist", "index.js")

const skipDir = (abs) => {
  const parts = abs.split(sep)
  return parts.includes("node_modules") || parts.includes("dist")
}

/** Minimal dirs so `blocks remove` can find installed primitives without a real `add`. */
function seedInstalledPrimitives(tmpDir, names) {
  const uiRoot = join(tmpDir, "src", "components", "ui")
  for (const name of names) {
    const dir = join(uiRoot, name)
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, `${name}.tsx`), `export {}\n`, "utf8")
    writeFileSync(join(dir, "index.ts"), `export * from "./${name}"\n`, "utf8")
  }
}

const tmp = mkdtempSync(join(tmpdir(), "blocks-cli-smoke-"))
try {
  cpSync(webApp, tmp, {
    recursive: true,
    dereference: true,
    filter: (src) => !skipDir(src),
  })

  seedInstalledPrimitives(tmp, ["button", "card", "dialog"])

  const run = (args) => {
    const r = spawnSync(process.execPath, [cliJs, ...args], {
      cwd: tmp,
      encoding: "utf8",
      env: { ...process.env, BLOCKS_CLI_YES: "1" },
    })
    if (r.stdout) process.stdout.write(r.stdout)
    if (r.stderr) process.stderr.write(r.stderr)
    if (r.status !== 0) {
      console.error(`smoke: failed blocks ${args.join(" ")}`)
      process.exit(r.status ?? 1)
    }
  }

  run(["init", "--yes", "--default-mode", "system", "--dry-run"])
  run(["add", "button", "card", "dialog", "--dry-run"])
  run(["add", "--all", "--dry-run"])
  run(["remove", "button", "card", "--dry-run"])
  run(["remove", "--all", "--dry-run", "--prune-deps"])
  console.info("smoke: OK")
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
