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
 * 将 表达式中的 类名 转换为 [cssModuleName][`类名`]，如：$style[`类名`]
 * @param code String
 * @param cssModuleName 模块名
 * @returns String
 */
export function transformExp(code: string, cssModuleName: string) {
  // :[attrName]="{}" :[attrName]='{}'
  if (isObjectExp(code)) {
    return transformObject(code, cssModuleName)
  }
  // :[attrName]="[]" :[attrName]='[]'
  else if (isArrayExp(code)) {
    return transformArray(code, cssModuleName)
  }
  // :[attrName]="type"  :[attrName]='type === "add" && "red"' :[attrName]="type === 'add' ? 'red' : 'green'"
  else {
    return transformString(code, cssModuleName)
  }
}

/**
 * 将 {} 中的类名换为 $style[`类名`]
 * @param code String
 * @param cssModuleName 模块名
 * @returns 转换后去除{}的字符串
 */
function transformObject(code: string, cssModuleName: string) {
  const contentArr = getObjectOrArrayExpressionContent(code).split(',')
  const result = contentArr
    .map((item) => {
      const [key, value] = item.split(':')
      return `[${cssModuleName}[${trimString(key)}]]:${trimString(value)}`
    })
    .join(',')
  return result
}

/**
 * 将 [] 中的类名换为 $style[`类名`]
 * @param code String
 * @param cssModuleName 模块名
 * @returns 转换后去除[]的字符串
 */
function transformArray(code: string, cssModuleName: string) {
  const contentArr = getObjectOrArrayExpressionContent(code).split(',')
  const result = contentArr.map((item) => `${cssModuleName}[${trimString(item)}]`).join(',')
  return result
}

/**
 * 直接将表达式加上模块名
 * @param code String
 * @param cssModuleName 模块名
 * @returns 表达式外部加上模块名
 */
function transformString(code: string, cssModuleName: string) {
  return `${cssModuleName}[${code}]`
}

/**
 * 判断是否是合法变量名
 * @param variableName string
 * @returns boolean
 */
export function isLegalVariate(variableName: string) {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(variableName)
}

/**
 * 判断是表达式是单引号还是双引号格式
 * @param code String
 * @returns '--单引号  "--双引号
 */
export function getQuote(code: string) {
  for (let i = 0; i < code.length; i++) {
    if (code[i] === '"') {
      return '"'
    }
    if (code[i] === "'") {
      return "'"
    }
  }
}

/**
 * 将单引号转为双引号，双引号转为单引号
 * @param code string
 * @returns string
 */
export function swapQuotes(code: string) {
  let result: string
  const placeholder = '__QUOTE__'
  // 将单引号替换为 __QUOTE__
  result = code.replace(/'/g, placeholder)
  // 将双引号替换为单引号
  result = result.replace(/"/g, "'")
  // 将占位符替换为双引号
  result = result.replace(new RegExp(placeholder, 'g'), '"')
  return result
}
