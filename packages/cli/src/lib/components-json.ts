import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

export type ComponentsJsonBlocks = {
  defaultMode: "light" | "dark" | "system"
}

export type ComponentsJson = {
  $schema?: string
  style: string
  rsc: boolean
  tsx: boolean
  tailwind: {
    config: string
    css: string
    baseColor: string
    cssVariables: boolean
    prefix: string
  }
  iconLibrary: string
  aliases: Record<string, string>
  blocks?: ComponentsJsonBlocks
}

export function buildComponentsJson(input: {
  framework: "vite" | "next"
  baseColor: string
  cssRelativePath: string
  defaultMode: ComponentsJsonBlocks["defaultMode"]
}): ComponentsJson {
  return {
    $schema: "https://ui.shadcn.com/schema.json",
    style: "default",
    rsc: input.framework === "next",
    tsx: true,
    tailwind: {
      config: "",
      css: input.cssRelativePath.replace(/\\/g, "/"),
      baseColor: input.baseColor,
      cssVariables: true,
      prefix: "",
    },
    iconLibrary: "lucide",
    aliases: {
      components: "@/components",
      utils: "@blocks/ui/lib/utils",
      hooks: "@/hooks",
      lib: "@/lib",
      ui: "@/components/ui",
    },
    blocks: {
      defaultMode: input.defaultMode,
    },
  }
}

export function writeComponentsJson(cwd: string, body: ComponentsJson, dryRun: boolean): void {
  const path = join(cwd, "components.json")
  const text = `${JSON.stringify(body, null, 2)}\n`
  if (dryRun) {
    console.info(`[dry-run] write ${path}\n${text}`)
    return
  }
  writeFileSync(path, text, "utf8")
}

export function readComponentsJson(cwd: string): ComponentsJson | null {
  try {
    const path = join(cwd, "components.json")
    const raw = readFileSync(path, "utf8")
    return JSON.parse(raw) as ComponentsJson
  } catch {
    return null
  }
}
