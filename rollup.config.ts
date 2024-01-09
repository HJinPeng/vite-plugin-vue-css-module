import { defineConfig } from 'rollup'
import { dts } from 'rollup-plugin-dts'
import resolve from '@rollup/plugin-node-resolve'
import esbuild from 'rollup-plugin-esbuild'

const extensions = ['.js', '.ts' ];

export default defineConfig([{
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
    },
    
  ],
  plugins: [
    resolve({ extensions }),
    esbuild({
      tsconfig: './tsconfig.json',
    })
  ]
}, {
  input: 'src/index.ts',
  output: [{ file: 'dist/index.d.ts', format: 'esm' }],
  plugins: [
    dts()
  ]
}])