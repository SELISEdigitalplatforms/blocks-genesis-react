import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  platform: "node",
  target: "node20",
  outDir: "dist",
  sourcemap: true,
  clean: true,
  bundle: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
})
