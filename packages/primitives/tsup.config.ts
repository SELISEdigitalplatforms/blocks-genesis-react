import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "http/index": "src/http/index.ts",
    "validators/index": "src/validators/index.ts",
    "formatters/index": "src/formatters/index.ts",
    "storage/index": "src/storage/index.ts",
  },
  format: ["esm", "cjs"],
  platform: "neutral",
  target: "es2020",
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
});
