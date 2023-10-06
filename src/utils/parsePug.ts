import {
  getObjectOrArrayExpressionContent,
  getPugVal,
  isArrayExp,
  isObjectExp,
  transform2SingleQuotes,
  transformExp,
  transformString2Array,
  transformString2ObjectString
} from './tool'
import { PluginOptions } from './types'

// 属性节点
interface Attr {
  name: string
  val: string
  line: number
  column: number
  mustEscape: boolean
}

// 标签节点
interface Node {
  attrs: undefined | Array<Attr>
}

// pug包，用于动态导入，避免不是用pug模板的项目报错
let pugPackage: {
  parse: any
  lexer: any
  walk: any
  wrap: any
  generate: any
}

const setPugPackage = () => {
  pugPackage = {
    parse: require('pug-parser'),
    lexer: require('pug-lexer'),
    walk: require('pug-walk'),
    wrap: require('pug-runtime/wrap'),
    generate: require('pug-code-gen')
  }
}

export function parsePug(source: string, options: PluginOptions, cssModuleName: string) {
  /** fix: 非使用pug模板的项目报缺少pug的相关依赖 */
  if (!pugPackage) setPugPackage()
  const { attrName, pugClassLiterals } = options
  const { parse, lexer, walk, wrap, generate } = pugPackage
  const ast = parse(lexer(source))
  walk(ast, (node: Node) => {
    if (node.attrs?.length) {
      let bindClassNode: Attr | undefined,
        bindAttrNameNode: Attr | undefined,
        attrNameNodes: Attr[] = []
      node.attrs.forEach((attr) => {
        switch (attr.name) {
          case ':class':
          case 'v-bind:class':
            bindClassNode = attr
            break
          case `:${attrName}`:
          case `v-bind:${attrName}`:
            bindAttrNameNode = attr
            break
          case attrName:
            attrNameNodes.push(attr)
            break
          case 'class':
            // Class literals are known to have mustEscape false.
            if (pugClassLiterals && attr.mustEscape === false) {
              attrNameNodes.push(attr)
            }
        }
      })

      if (attrNameNodes.length) {
        const attrNameArr = transformString2Array(
          attrNameNodes.map((node) => getPugVal(node.val)).join(' ')
        )
        if (attrNameArr.length) {
          // :class
          if (bindClassNode) {
            let result: string
            const bindClassContent = transform2SingleQuotes(getPugVal(bindClassNode.val))
            // :class="{}"  :class='{}'
            if (isObjectExp(bindClassContent)) {
              // 获取{}中间的内容
              let objectContent = getObjectOrArrayExpressionContent(bindClassContent)
              /** fix: :class="{}" 和 :class="[]" 报错 */
              if (objectContent) {
                objectContent += ','
              }
              result = `"{${objectContent}${attrNameArr
                .map((cls) => `[${cssModuleName}['${cls}']]:true`)
                .join(',')}}"`
            }
            // :class="[]" :class='[]'
            else if (isArrayExp(bindClassContent)) {
              const arrayContent = getObjectOrArrayExpressionContent(bindClassContent)
              result = `"[${arrayContent}, ${attrNameArr
                .map((cls) => `${cssModuleName}['${cls}']`)
                .join(',')}]"`
            }
            // :class="type" :class='type === "add" && "red"' :class="type === 'add' ? 'red' : 'green'"
            else {
              result = `"[${bindClassContent},${attrNameArr
                .map((cls) => `${cssModuleName}['${cls}']`)
                .join(',')}]"`
            }
            // 修改 :class的值
            bindClassNode.val = result
          }
          // 只存在 或 不存在 class
          else {
            // Convert the first class attribute to :class.
            const attrNameNode = attrNameNodes.shift()!
            attrNameNode.mustEscape = true
            attrNameNode.name = `:class`
            attrNameNode.val = `"[${attrNameArr
              .map((cls) => `${cssModuleName}['${cls}']`)
              .join(',')}]"`

            /**
             * fix: Duplicate :class
             */
            bindClassNode = attrNameNode;
          }
        }
        // 删除 attrName 属性
        if (attrNameNodes.length) {
          node.attrs = node.attrs.filter((attr) => !attrNameNodes.includes(attr))
        }
      }
      // 如果 attrName = cls, 且 :cls="" 存在
      if (bindAttrNameNode) {
        const bindAttrNameContent = transform2SingleQuotes(getPugVal(bindAttrNameNode.val))
        const bindAttrNameContent2CssModuleNameStr = transformExp(
          bindAttrNameContent,
          cssModuleName,
          "'"
        )
        // :cls的值为空、空数组、空对象，删除该属性
        if (!bindAttrNameContent2CssModuleNameStr) {
          node.attrs = node.attrs.filter((attr) => attr !== bindAttrNameNode)
          return
        }
        // :class 存在
        if (bindClassNode) {
          // 双引号转为单引号
          const bindClassContent = transform2SingleQuotes(getPugVal(bindClassNode.val))
          let result: string
          // :class="{}"
          if (isObjectExp(bindClassContent)) {
            // 获取{}中间的内容
            let objectContent = getObjectOrArrayExpressionContent(bindClassContent)
            /** fix: :class="{}" 和 :class="[]" 报错 */
            if (objectContent) {
              objectContent += ','
            }
            // :class="{}"  :cls="{}"
            if (isObjectExp(bindAttrNameContent)) {
              result = `"{${objectContent}${bindAttrNameContent2CssModuleNameStr}}"`
            }
            // :class="{}"  :cls="[]" 或 :cls="exp"
            else {
              result = `"{${objectContent}${transformString2ObjectString(
                bindAttrNameContent2CssModuleNameStr,
                "'"
              )}}"`
            }
          }
          // :class="[]"
          else if (isArrayExp(bindClassContent)) {
            // 获取[]中间的内容
            let arrayContent = getObjectOrArrayExpressionContent(bindClassContent)
            // :class="[]" :cls="{}"
            if (isObjectExp(bindAttrNameContent)) {
              arrayContent = transformString2ObjectString(arrayContent, "'")
              /** fix: :class="{}" 和 :class="[]" 报错 */
              if (arrayContent) {
                arrayContent += ','
              }
              result = `"{${arrayContent}${bindAttrNameContent2CssModuleNameStr}}"`
            }
            // :class="[]" :cls="[]" 或 :cls="exp"
            else {
              result = `"[${arrayContent},${bindAttrNameContent2CssModuleNameStr}]"`
            }
          }
          // :class="exp"
          else {
            // :class="exp" :cls="{}"
            if (isObjectExp(bindAttrNameContent)) {
              result = `"{${transformString2ObjectString(
                bindClassContent,
                "'"
              )},${bindAttrNameContent2CssModuleNameStr}}"`
            }
            // :class="exp" :cls="[]" 或 :cls="exp"
            else {
              result = `"[${bindClassContent},${bindAttrNameContent2CssModuleNameStr}]"`
            }
          }
          bindClassNode.val = result
          // 删除 :cls节点
          node.attrs = node.attrs.filter((attr) => attr !== bindAttrNameNode)
        } else {
          bindAttrNameNode.name = ':class'
          // :cls="{}"
          if (isObjectExp(bindAttrNameContent)) {
            bindAttrNameNode.val = `"{${bindAttrNameContent2CssModuleNameStr}}"`
          } else {
            bindAttrNameNode.val = `"[${bindAttrNameContent2CssModuleNameStr}]"`
          }
        }
      }
    }
  })
  const templateFn = wrap(generate(ast))
  return templateFn()
}
