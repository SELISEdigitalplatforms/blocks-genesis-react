import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "query-state/index": "src/query-state/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ["react", "nuqs"],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client"',
    };
  },
});
