import { parse } from '@vue/compiler-sfc'

/**
 * 获取.vue文件中的template的AST
 * @param code vue文件
 * @returns template AST
 */
export function getTemplateAst(code: string) {
  return parse(code).descriptor.template?.ast
}
