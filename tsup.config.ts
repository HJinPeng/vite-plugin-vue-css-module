import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  sourcemap: true,
  dts: true,
  clean: true,
  external: ['vite', 'vue', 'pug-parser', 'pug-lexer', 'pug-walk', 'pug-runtime/wrap.js', 'pug-code-gen', 'vue/compiler-sfc']
})