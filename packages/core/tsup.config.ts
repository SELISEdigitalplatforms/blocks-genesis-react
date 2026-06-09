import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  format: ["esm", "cjs"],
  platform: "neutral",
  target: "es2020",
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
});
