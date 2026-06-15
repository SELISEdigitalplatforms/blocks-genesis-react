import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "query-client/index": "src/query-client/index.ts",
    "query-state/index": "src/query-state/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ["react", "nuqs", "@tanstack/react-query"],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client"',
    };
  },
});
