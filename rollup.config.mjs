import typescript from '@rollup/plugin-typescript'
export default {
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
    },
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'vite-plugin-vue-css-module',
      globals: {
        'magic-string': 'MagicString',
        '@vue/compiler-sfc': 'CompilerSfc',
        '@babel/parser': 'BabelParser',
        '@babel/generator': 'BabelGenerator',
        '@babel/traverse': 'BabelTraverse',
        '@babel/types': 'BabelTypes'
      },
      sourcemap: true
    }
  ],
  plugins: [
    typescript()
  ],
  external: ['magic-string', '@vue/compiler-sfc', '@vue/compiler-core', '@babel/parser',  '@babel/types', '@babel/traverse', '@babel/generator', '@babel/traverse/lib/index.js'],
  
}