import { parse } from '@babel/parser'
import _generate from '@babel/generator'
import _traverse from '@babel/traverse'
import {
  identifier,
  isIdentifier,
  isObjectProperty,
  memberExpression,
  templateLiteral,
  templateElement,
  isStringLiteral,
  isLogicalExpression,
  isConditionalExpression,
  isArrayExpression
} from '@babel/types'

// https://github.com/babel/babel/issues/13855
// @ts-ignore
const traverse = _traverse.default as typeof _traverse
const generate = (_generate as any).default as typeof _generate

/**
 * 判断是否是 对象表达式 字符串
 * @param code String
 * @returns Boolean
 */
export function isObjectExp(code: string) {
  return code.startsWith('{') && code.endsWith('}')
}

/**
 * 判断是否是 数组表达式 字符串
 * @param code String
 * @returns Boolean
 */
export function isArrayExp(code: string) {
  return code.startsWith('[') && code.endsWith(']')
}

/**
 * 获取 对象/数组表达式字符串 中间的内容
 * @param code String -- { a: 1, }   [ 'a', true && 'b', 1 < 2 ? 'c' : 'd']
 * @returns String -- a: 1
 */
export function getObjectOrArrayExpressionContent(code: string) {
  let str = trimString(code.substring(1, code.length - 1))
  return str.endsWith(',') ? str.substring(0, str.length - 1) : str
}

/**
 * 去除字符串前后空格
 * @param code String
 * @returns String
 */
export function trimString(code: string) {
  return code.trim()
}

/**
 *
 * @param code String a b  c   d--e
 * @returns ['a', 'b', 'c', 'd--e']
 */
export function transformString2Array(code: string) {
  return code.split(' ').filter((str) => str)
}

/**
 * 将 字符串 转为 对象中的key:value 字符串。eg: type && $style[`red`] -> [type && $style[`red`]]:type && $style[`red`]
 * @param code String
 * @returns String
 */
export function transformString2ObjectString(code: string) {
  return code
    .split(',')
    .map((val) => {
      const _val = trimString(val)
      return `[${_val}]:${_val}`
    })
    .join(',')
}

/**
 * 通过 babel 将 表达式中的 类名 转换为 $style[`类名`]
 * @param code String
 * @returns String
 */
export function transformByBabel(code: string) {
  // :[attrName]="{}" :[attrName]='{}'
  if (isObjectExp(code)) {
    return transformObjectByBabel(code)
  }
  // :[attrName]="[]" :[attrName]='[]'
  else if (isArrayExp(code)) {
    return transformArrayByBabel(code)
  }
  // :[attrName]="type"  :[attrName]='type === "add" && "red"' :[attrName]="type === 'add' ? 'red' : 'green'"
  else {
    return transformStringByBabel(code)
  }
}

/**
 * 通过babel转换 将 {} 中的类名换为 $style[`类名`]
 * @param code String
 * @returns 转换后去除{}的字符串
 */
function transformObjectByBabel(code: string) {
  // 生成抽象语法树
  const ast = parse(`var s = ${code}`)
  // 转换 将类名转为 $style[类名]
  traverse(ast, {
    exit(path: any) {
      if (
        (isIdentifier(path.node) || isStringLiteral(path.node)) &&
        path.parentPath &&
        isObjectProperty(path.parentPath.node)
      ) {
        path.parentPath.node.computed = true
        const _val = isIdentifier(path.node) ? path.node.name : path.node.value
        path.replaceWith(
          memberExpression(
            identifier('$style'),
            templateLiteral([templateElement({ raw: _val })], []),
            true,
            false
          )
        )
      }
    }
  })
  // 转换后的字符串
  let result = generate(ast).code
  result = result.substring(9, result.length - 2)
  return result
}

/**
 * 通过babel转换 将 [] 中的类名换为 $style[`类名`]
 * @param code String
 * @returns 转换后去除[]的字符串
 */
function transformArrayByBabel(code: string) {
  const ast = parse(code)
  traverse(ast, {
    exit(path: any) {
      if (
        isStringLiteral(path.node) &&
        path.node.value &&
        path.parentPath &&
        (isLogicalExpression(path.parentPath.node) ||
          isConditionalExpression(path.parentPath.node) ||
          isArrayExpression(path.parentPath.node))
      ) {
        path.replaceWith(
          memberExpression(
            identifier('$style'),
            templateLiteral([templateElement({ raw: path.node.value })], []),
            true,
            false
          )
        )
      }
    }
  })
  let result = generate(ast).code
  result = result.substring(1, result.length - 2)
  return result
}

/**
 * 通过babel转换 将 exp 中的类名换为 $style[`类名`]
 * @param code String
 * @returns 转换后的字符串
 */
function transformStringByBabel(code: string) {
  const ast = parse(code)
  traverse(ast, {
    exit(path: any) {
      if (
        isStringLiteral(path.node) &&
        path.node.value &&
        path.parentPath &&
        (isLogicalExpression(path.parentPath.node) || isConditionalExpression(path.parentPath.node))
      ) {
        path.replaceWith(
          memberExpression(
            identifier('$style'),
            templateLiteral([templateElement({ raw: path.node.value })], []),
            true,
            false
          )
        )
      }
    }
  })
  let result = generate(ast).code
  result = result.substring(0, result.length - 1)
  return result
}
