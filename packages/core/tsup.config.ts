import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "http/index": "src/http/index.ts",
    "runtime-env/index": "src/runtime-env/index.ts",
    "auth/index": "src/auth/index.ts",
  },
  format: ["esm", "cjs"],
  platform: "neutral",
  target: "es2020",
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
});
