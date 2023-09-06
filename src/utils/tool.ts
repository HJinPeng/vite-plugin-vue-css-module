// 引号类型
type Quote = "'" | '"'

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
  if (!code) return ''
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
 * @param quote 引号类型
 * @param keepReturnType 返回值是否保留原类型，true: {***} => {***}, false: {***} => *** 
 * @returns String
 */
export function transformExp(code: string, cssModuleName: string, quote: Quote, keepReturnType: Boolean = false): string {
  // :[attrName]="{}" :[attrName]='{}'
  if (isObjectExp(code)) {
    return transformObject(code, cssModuleName, quote, keepReturnType)
  }
  // :[attrName]="[]" :[attrName]='[]'
  else if (isArrayExp(code)) {
    return transformArray(code, cssModuleName, quote, keepReturnType)
  }
  // :[attrName]="type"  :[attrName]='type === "add" && "red"' :[attrName]="type === 'add' ? 'red' : 'green'"
  else {
    return transformString(code, cssModuleName)
  }
}


/**
 * 将字符串根据英文逗号, 切割成数组。其中 {}, [] 是一个整体
 * eg: 'red', ['green', { red:  type === ' red{, '}, {type}], {} 
 *     =>
 *     [
 *        'red', 
 *        ['green', { red: type === ' red{, '}, {type}], 
 *        {}
 *     ]
 *     
 *     red: type === ' red{, ', type
 *     =>
 *     [
 *        red: type === ' red{, ',
 *        type
 *     ]
 * @param code 字符串 
 * @param quote 字符串内用到的引号
 * @returns 切割后的数组
 */
function splitStr2Arr(code: string, quote: Quote) {
  // 切割后的数组
  const result = [];
  // 缓存的字符
  let buffer = '';
  // 栈，存放 [ { '
  let stack:string[] = [];

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    if (char === '{' || char === '[') {
      // 如果stack的顶部是引号, 则不用进栈，理解为普通字符。否则进栈
      if(stack.length > 0 && stack[stack.length - 1] === quote) {
        buffer += char;
      }else {
        stack.push(char);
        buffer += char;
      }
    } else if (char === '}') {
      // 如果stack的顶部是{, 则{出栈
      if (stack.length > 0 && stack[stack.length - 1] === '{') {
        stack.pop();
        buffer += char;
      } else {
        buffer += char;
      }
    }else if(char === ']') {
      // 如果stack的顶部是[, 则[出栈
      if (stack.length > 0 && stack[stack.length - 1] === '[') {
        stack.pop();
        buffer += char;
      } else {
        buffer += char;
      }
    }else if(char === quote) {
      // 如果stack的顶部是引号，则引号出栈。否则引号要入栈，用于后续判断{[}]是 普通字符 还是 对象、数组的起止符号
      if(stack.length > 0 && stack[stack.length - 1] === quote) {
        stack.pop();
        buffer += char;
      }else {
        stack.push(quote)
        buffer += char;
      }
    } else if (char === ',') {
      // 碰到逗号，当栈为空了，则将缓存字符作为数组的一项，如果栈不是空的，那逗号就只是一个普通字符
      if (stack.length === 0) {
        result.push(trimString(buffer));
        buffer = '';
      } else {
        buffer += char;
      }
    } else {
      buffer += char;
    }
  }

  if (trimString(buffer) !== '') {
    result.push(trimString(buffer));
  }

  return result;
}


/**
 * 将 {} 中的类名换为 $style[`类名`]
 * @param code String
 * @param cssModuleName 模块名
 * @param quote 引号类型
 * @param keepReturnType 返回值是否保留原类型，true: {***} => {***}, false: {***} => *** 
 * @returns 转换后去除{}的字符串
 */
function transformObject(code: string, cssModuleName: string, quote: Quote, keepReturnType: Boolean): string {
  const content = getObjectOrArrayExpressionContent(code)
  if (!content) return ''
  const contentArr = splitStr2Arr(content, quote)
  const result = contentArr
    .map((item) => {
      // 没有冒号时，即 { selected } 这种情况，则直接取 selected
      let key:string = item, value:string = item;
      // fix: type: type === 'a:b'   这里取第一个冒号进行切割
      let firstColonIndex = item.indexOf(':');
      if(firstColonIndex !== -1) {
        key = item.slice(0, firstColonIndex);
        value = item.slice(firstColonIndex + 1);
      }
      let _key = trimString(key)
      // { [type]: true } => [$style[type]]: true;
      // { type: true} => [$style["type"]]: true 需要加""
      if (isLegalVariate(_key)) {
        _key = `${quote}${_key}${quote}`
      }
      return `[${cssModuleName}[${_key}]]:${trimString(value)}`
    })
    .join(',')
  return keepReturnType ? '{' + result + '}' : result;
}

/**
 * 将 [] 中的类名换为 $style[`类名`]
 * @param code String
 * @param cssModuleName 模块名
 * @param quote 引号类型
 * @param keepType 返回值是否保留原类型，true: [***] => [***], false: [***] => *** 
 * @returns 转换后去除[]的字符串
 */
function transformArray(code: string, cssModuleName: string, quote: Quote, keepReturnType: Boolean): string {
  const content = getObjectOrArrayExpressionContent(code)
  if (!content) return ''
  
  const contentArr = splitStr2Arr(content, quote);
  const result = contentArr.map((item) => {
    /**
     * 数组中可以是各种表达式：数组，对象，表达式，字符串
     * 保持返回类型
     */
    return transformExp(item, cssModuleName, quote, true)
  }).join(',')
  return keepReturnType ? '[' +result + ']':  result
}

/**
 * 直接将表达式加上模块名
 * @param code String
 * @param cssModuleName 模块名
 * @returns 表达式外部加上模块名
 */
function transformString(code: string, cssModuleName: string): string {
  if (!code) return ''
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
 * @returns '--单引号  "--双引号 `--模版符号
 */
export function getQuote(code: string) {
  for (let i = 0; i < code.length; i++) {
    if (code[i] === '"') {
      return '"'
    }
    if (code[i] === "'") {
      return "'"
    }
    if (code[i] === '`') {
      return '`'
    }
  }
  return ''
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

/**
 * 将代码中的双引号改为单引号
 * @param code string
 * @returns string
 */
export function transform2SingleQuotes(code: string) {
  return code.replace(/"/g, "'")
}

/**
 * 获取pug属性节点的val值，去除前后符号和空格
 * @param code pug的attrs的节点
 * @returns string
 */
export function getPugVal(code: string | boolean) {
  if (typeof code === 'boolean') return ''
  return trimString(code.substring(1, code.length - 1))
}
