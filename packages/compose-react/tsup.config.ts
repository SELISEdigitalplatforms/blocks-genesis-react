import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "store/index": "src/store/index.ts",
    "providers/index": "src/providers/index.ts",
    "guards/index": "src/guards/index.ts",
    "layouts/index": "src/layouts/index.ts",
    "types/index": "src/types/index.ts",
    "http/index": "src/lib/http/index.ts",
    "hooks/index": "src/hooks/index.ts",
    "utils/index": "src/utils/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  loader: {
    ".svg": "dataurl",
    ".png": "dataurl",
    ".jpg": "dataurl",
    ".jpeg": "dataurl",
    ".gif": "dataurl",
    ".webp": "dataurl",
  },
  external: [
    "react",
    "react-dom",
    "react-router-dom",
    "zustand",
    "zustand/middleware",
    "@tanstack/react-query",
    "nuqs",
  ],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client"',
    };
  },
});
