import typescript from '@rollup/plugin-typescript'
import { dts } from 'rollup-plugin-dts'

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        sourcemap: true
      },
      {
        file: 'dist/index.mjs',
        format: 'es',
        sourcemap: true
      }
    ],
    plugins: [typescript()],
    external: [
      'magic-string',
      '@vue/compiler-sfc',
      '@vue/compiler-core',
      'pug-parser',
      'pug-lexer',
      'pug-walk',
      'pug-runtime/wrap',
      'pug-code-gen'
    ]
  },
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()]
  }
]
