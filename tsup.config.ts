import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  outExtension(ctx) {
    if (ctx.format === 'cjs') return {
      js: '.cjs',
    }
    return {
      js: '.esm.js',
    }
  },
})
