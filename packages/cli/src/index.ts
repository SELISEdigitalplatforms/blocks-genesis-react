import { Command } from "commander"

import { addCommand } from "./commands/add.js"
import { doctorCommand } from "./commands/doctor.js"
import { initCommand } from "./commands/init.js"
import { listCommand } from "./commands/list.js"
import { removeCommand } from "./commands/remove.js"
import { resolveCwd } from "./lib/context.js"
import type { PackageManager } from "./lib/pm.js"

const program = new Command()

program
  .name("blocks")
  .description("Blocks UI CLI — install @blocks-kit/ui primitives and blocks in React apps")
  .option("-c, --cwd <path>", "project root", process.cwd())
  .option("--dry-run", "print actions without writing files or installing", false)
  .option("-y, --yes", "non-interactive defaults", false)

function sharedGlobals(cmd: Command): {
  cwd: string
  dryRun: boolean
  yes: boolean
} {
  const root = (cmd.parent ?? cmd) as Command
  const opts = root.opts() as { cwd?: string; dryRun?: boolean; yes?: boolean }
  return {
    cwd: resolveCwd(opts.cwd),
    dryRun: opts.dryRun === true,
    yes: opts.yes === true,
  }
}

program
  .command("init")
  .description("Write components.json, patch globals CSS, install @blocks-kit/ui")
  .option("-t, --template <vite|next>", "framework (vite or next)")
  .option("--theme <color>", "tailwind baseColor (slate, zinc, neutral, stone, gray)")
  .option("--default-mode <light|dark|system>", "default theme mode for next-themes")
  .option("--pm <pnpm|npm|yarn>", "package manager")
  .action(
    async (
      opts: {
        template?: string
        theme?: string
        defaultMode?: string
        pm?: string
      },
      cmd: Command,
    ) => {
      const g = sharedGlobals(cmd)
      let template: "vite" | "next" | undefined
      if (opts.template === "vite" || opts.template === "next") {
        template = opts.template
      } else if (opts.template) {
        console.error(`Invalid --template "${opts.template}". Use vite or next.`)
        process.exitCode = 1
        return
      }
      await initCommand({
        cwd: g.cwd,
        dryRun: g.dryRun,
        yes: g.yes,
        template,
        theme: opts.theme,
        defaultMode: opts.defaultMode as "light" | "dark" | "system" | undefined,
        pm: opts.pm as PackageManager | undefined,
      })
    },
  )

program
  .command("add")
  .description("Install primitives (copy into project) and blocks (npm deps only)")
  .argument("[components...]", "component / block names")
  .option("--all", "select every registry item", false)
  .option("--overwrite", "overwrite existing primitive files", false)
  .option("--pm <pnpm|npm|yarn>", "package manager")
  .action(
    async (
      components: string[],
      opts: { all?: boolean; overwrite?: boolean; pm?: string },
      cmd: Command,
    ) => {
      const g = sharedGlobals(cmd)
      await addCommand({
        cwd: g.cwd,
        dryRun: g.dryRun,
        yes: g.yes,
        components: components ?? [],
        all: opts.all === true,
        overwrite: opts.overwrite === true,
        pm: opts.pm as PackageManager | undefined,
      })
    },
  )

program
  .command("remove")
  .description("Remove copied primitives from the project (blocks are import-only)")
  .argument("[components...]", "component / block names")
  .option("--all", "remove every copied primitive under aliases.ui", false)
  .option("--prune-deps", "uninstall npm deps only used by removed components", false)
  .option("--pm <pnpm|npm|yarn>", "package manager (for --prune-deps)")
  .action(
    async (
      components: string[],
      opts: { all?: boolean; pruneDeps?: boolean; pm?: string },
      cmd: Command,
    ) => {
      const g = sharedGlobals(cmd)
      await removeCommand({
        cwd: g.cwd,
        dryRun: g.dryRun,
        yes: g.yes,
        components: components ?? [],
        all: opts.all === true,
        pruneDeps: opts.pruneDeps === true,
        pm: opts.pm as PackageManager | undefined,
      })
    },
  )

program
  .command("list")
  .description("List registry primitives and blocks")
  .option("-k, --kind <primitive|block|all>", "filter by kind", "all")
  .option("-q, --query <text>", "filter by name / description")
  .action(async (opts: { kind?: string; query?: string }, cmd: Command) => {
    const g = sharedGlobals(cmd)
    await listCommand({
      cwd: g.cwd,
      dryRun: g.dryRun,
      kind: opts.kind ?? "all",
      query: opts.query,
    })
  })

program
  .command("doctor")
  .description("Check React, @blocks-kit/ui, components.json, and globals CSS wiring")
  .action(async (_opts: unknown, cmd: Command) => {
    const g = sharedGlobals(cmd)
    await doctorCommand({ cwd: g.cwd, dryRun: g.dryRun })
  })

async function main(): Promise<void> {
  await program.parseAsync(process.argv)
}

await main()
