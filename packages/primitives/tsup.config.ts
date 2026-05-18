import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "http/index": "src/http/index.ts",
    "validators/index": "src/validators/index.ts",
    "currency/index": "src/currency/index.ts",
    "number/index": "src/number/index.ts",
    "date/index": "src/date/index.ts",
    "file/index": "src/file/index.ts",
    "parser/index": "src/parser/index.ts",
    "storage/index": "src/storage/index.ts",
    "utils/index": "src/utils/index.ts",
  },
  format: ["esm", "cjs"],
  platform: "neutral",
  target: "es2020",
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
});
