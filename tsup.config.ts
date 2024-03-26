import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  sourcemap: true,
  dts: true,
  clean: true,
  // Remove those once https://github.com/egoist/tsup/issues/1099 is fixed.
  external: [
    'pug-code-gen',
    'pug-lexer',
    'pug-parser',
    'pug-runtime',
    'pug-walk',
  ],
})
