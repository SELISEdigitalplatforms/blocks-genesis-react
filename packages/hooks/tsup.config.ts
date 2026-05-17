import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['react'],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client"', // needed for Next.js App Router consumers
    }
  },
})
