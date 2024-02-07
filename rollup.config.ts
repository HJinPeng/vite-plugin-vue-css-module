import { defineConfig } from 'rollup'
import { dts } from 'rollup-plugin-dts'
import resolve from '@rollup/plugin-node-resolve'
import esbuild from 'rollup-plugin-esbuild'

const extensions = ['.js', '.ts' ];

export default defineConfig([
  
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist',
      format: 'esm'
    },
    plugins: [
      dts()
    ]
  },
  {
    input: 'src/index.ts',
    external: ['vue', 'pug-parser', 'pug-lexer', 'pug-walk', 'pug-runtime/wrap', 'pug-code-gen', 'vue/compiler-sfc', 'magic-string'],
    output: [
      {
        inlineDynamicImports: true,
        dir: 'dist/esm',
        format: 'esm',
        sourcemap: true,
      },
      {
        dynamicImportInCjs: true,
        dir: 'dist/cjs',
        format: 'commonjs',
        sourcemap: true,
      },
    ],
    plugins: [
      resolve({ extensions }),
      esbuild({
        tsconfig: './tsconfig.json',
      })
    ]
  }
])