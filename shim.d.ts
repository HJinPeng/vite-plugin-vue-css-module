// Stub types for sanity type checks.

type PugTokens = {
  __tokens?: true
}

type PugAst = {
  __ast?: true
}

declare module 'pug-lexer' {
  export default function lexer(source: string): PugTokens
}

declare module 'pug-parser' {
  export default function parse(source: PugTokens): PugAst
}

declare module 'pug-source-gen' {
  export default function generate(ast: PugAst): string
}

declare module 'pug-walk' {
  export default function walk(ast: PugAst, fn: (node: any) => void): void
}
