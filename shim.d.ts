declare module 'pug-parser' {
  export function parse(source: string): any
}

declare module 'pug-lexer' {
  export function lexer(source: string): any
}

declare module 'pug-walk' {
  export function walk(ast: any, fn: (node: any) => void): void
}

declare module 'pug-runtime/wrap.js' {
  export function wrap(source: string): any
}

declare module 'pug-code-gen' {
  export function generate(ast: any): any
}