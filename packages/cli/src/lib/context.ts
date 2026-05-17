import { resolve } from "node:path"

export type ResolvedContext = {
  cwd: string
  dryRun: boolean
}

export function resolveCwd(flagCwd?: string): string {
  return resolve(flagCwd ?? process.cwd())
}
