import { readFileSync } from "node:fs"
import { join } from "node:path"

export type PackageJsonLike = {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

export function readPackageJson(cwd: string): PackageJsonLike {
  const path = join(cwd, "package.json")
  return JSON.parse(readFileSync(path, "utf8")) as PackageJsonLike
}
