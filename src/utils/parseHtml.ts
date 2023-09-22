import type { AttributeNode, DirectiveNode, TemplateChildNode } from '@vue/compiler-core'
import MagicString from 'magic-string'
import {
  trimString,
  isObjectExp,
  isArrayExp,
  getObjectOrArrayExpressionContent,
  transformString2Array,
  transformExp,
  transformString2ObjectString,
  getQuote,
  swapQuotes
} from './tool'

export function parseHtml(
  childNode: TemplateChildNode[],
  s: MagicString,
  attrName: string,
  cssModuleName: string
) {
  childNode.forEach((node) => {
    if ('props' in node) {
      let bindClassNode: DirectiveNode | undefined,
        attrNameNode: AttributeNode | undefined,
        bindAttrNameNode: DirectiveNode | undefined
      node.props.forEach((prop) => {
        if (prop.name === 'bind' && 'arg' in prop && prop.arg && 'content' in prop.arg) {
          // :class
          if (prop.arg.content === 'class') {
            bindClassNode = prop
          }
          // 如果 attrName = cls, 则是 :cls=""
          else if (prop.arg.content === attrName) {
            bindAttrNameNode = prop
          }
        }
        // 如果 attrName = cls, 则是 cls=""
        else if (prop.name === attrName && 'value' in prop) {
          attrNameNode = prop
        }
      })
      // 如果 attrName = cls, 且 :cls="" 存在
      if (bindAttrNameNode && bindAttrNameNode.exp && 'content' in bindAttrNameNode.exp) {
        // 返回表达式的引号 :cls='' -> '   :cls="" -> "
        const bindAttrNameQuote = getQuote(bindAttrNameNode.loc.source)
        const bindAttrNameContent = trimString(bindAttrNameNode.exp.content)
        // 将:cls=""中的类名加上cssModuleName.
        let bindAttrNameContent2CssModuleNameStr: string = transformExp(
          bindAttrNameContent,
          cssModuleName,
          bindAttrNameQuote === "'" ? '"' : "'"
        )
        if (!bindAttrNameContent2CssModuleNameStr) {
          s.update(bindAttrNameNode.loc.start.offset, bindAttrNameNode.loc.end.offset, '')
          return
        }
        // :class exist
        if (bindClassNode && bindClassNode.exp && 'content' in bindClassNode.exp) {
          const bindClassQuote = getQuote(bindClassNode.loc.source)
          const bindClassContent = trimString(bindClassNode.exp.content)
          // :class 和 :cls 用的引号不一致（源代码不规范的情况可能出现）
          if (bindAttrNameQuote !== bindClassQuote) {
            bindAttrNameContent2CssModuleNameStr = swapQuotes(bindAttrNameContent2CssModuleNameStr)
          }
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
              result = `:class=${bindClassQuote}{${objectContent}${bindAttrNameContent2CssModuleNameStr}}${bindClassQuote}`
            }
            // :class="{}"  :cls="[]" 或 :cls="exp"
            else {
              result = `:class=${bindClassQuote}{${objectContent}${transformString2ObjectString(
                bindAttrNameContent2CssModuleNameStr,
                bindClassQuote === '"' ? "'" : '"'
              )}}${bindClassQuote}`
            }
          }
          // :class="[]"
          else if (isArrayExp(bindClassContent)) {
            // 获取[]中间的内容
            let arrayContent = getObjectOrArrayExpressionContent(bindClassContent)
            // :class="[]" :cls="{}"
            if (isObjectExp(bindAttrNameContent)) {
              arrayContent = transformString2ObjectString(
                arrayContent,
                bindClassQuote === '"' ? "'" : '"'
              )
              /** fix: :class="{}" 和 :class="[]" 报错 */
              if (arrayContent) {
                arrayContent += ','
              }
              result = `:class=${bindClassQuote}{${arrayContent}${bindAttrNameContent2CssModuleNameStr}}${bindClassQuote}`
            }
            // :class="[]" :cls="[]" 或 :cls="exp"
            else {
              result = `:class=${bindClassQuote}[${arrayContent},${bindAttrNameContent2CssModuleNameStr}]${bindClassQuote}`
            }
          }
          // :class="exp"
          else {
            // :class="exp" :cls="{}"
            if (isObjectExp(bindAttrNameContent)) {
              result = `:class=${bindClassQuote}{${transformString2ObjectString(
                bindClassContent,
                bindClassQuote === '"' ? "'" : '"'
              )},${bindAttrNameContent2CssModuleNameStr}}${bindClassQuote}`
            }
            // :class="exp" :cls="[]" 或 :cls="exp"
            else {
              result = `:class=${bindClassQuote}[${bindClassContent},${bindAttrNameContent2CssModuleNameStr}]${bindClassQuote}`
            }
          }
          // 修改 :class 属性
          s.update(bindClassNode.loc.start.offset, bindClassNode.loc.end.offset, result)
          // 删除 attrName 属性
          s.update(bindAttrNameNode.loc.start.offset, bindAttrNameNode.loc.end.offset, '')
        } else {
          // :cls="{}"
          if (isObjectExp(bindAttrNameContent)) {
            s.update(
              bindAttrNameNode.loc.start.offset,
              bindAttrNameNode.loc.end.offset,
              `:class=${bindAttrNameQuote}{${bindAttrNameContent2CssModuleNameStr}}${bindAttrNameQuote}`
            )
          } else {
            s.update(
              bindAttrNameNode.loc.start.offset,
              bindAttrNameNode.loc.end.offset,
              `:class=${bindAttrNameQuote}[${bindAttrNameContent2CssModuleNameStr}]${bindAttrNameQuote}`
            )
          }
        }
      }
      if (attrNameNode) {
        const attrNameQuote = getQuote(attrNameNode.loc.source)
        let attrNameArr = transformString2Array(attrNameNode.value?.content || '')
        // 没有值，删除 attrName 属性
        if (attrNameArr.length === 0) {
          s.update(attrNameNode.loc.start.offset, attrNameNode.loc.end.offset, '')
          return
        }
        // :class
        if (bindClassNode && bindClassNode.exp && 'content' in bindClassNode.exp) {
          const bindClassQuote = getQuote(bindClassNode.loc.source)
          const strQuote = bindClassQuote === "'" ? '"' : "'"
          const bindClassContent = trimString(bindClassNode.exp.content)

          let result: string
          // :class="{}"  :class='{}'
          if (isObjectExp(bindClassContent)) {
            // 获取{}中间的内容
            let objectContent = getObjectOrArrayExpressionContent(bindClassContent)
            /** fix: :class="{}" 和 :class="[]" 报错 */
            if (objectContent) {
              objectContent += ','
            }
            result = `:class=${bindClassQuote}{${objectContent}${attrNameArr
              .map((val) => `[${cssModuleName}[${strQuote}${val}${strQuote}]]:true`)
              .join(',')}}${bindClassQuote}`
          }
          // :class="[]" :class='[]'
          else if (isArrayExp(bindClassContent)) {
            let arrayContent = getObjectOrArrayExpressionContent(bindClassContent)
            if (arrayContent) {
              arrayContent += ','
            }
            result = `:class=${bindClassQuote}[${arrayContent}${attrNameArr
              .map((val) => `${cssModuleName}[${strQuote}${val}${strQuote}]`)
              .join(',')}]${bindClassQuote}`
          }
          // :class="type" :class='type === "add" && "red"' :class="type === 'add' ? 'red' : 'green'"
          else {
            result = `:class=${bindClassQuote}[${bindClassContent},${attrNameArr
              .map((val) => `${cssModuleName}[${strQuote}${val}${strQuote}]`)
              .join(',')}]${bindClassQuote}`
          }
          // 修改 :class 属性
          s.update(bindClassNode.loc.start.offset, bindClassNode.loc.end.offset, result)
          // 删除 attrName 属性
          s.update(attrNameNode.loc.start.offset, attrNameNode.loc.end.offset, '')
        }
        // 只存在 或 不存在 class
        else {
          const strQuote = attrNameQuote === "'" ? '"' : "'"
          // 将 attrName 属性 改为 :class
          s.update(
            attrNameNode.loc.start.offset,
            attrNameNode.loc.end.offset,
            `:class=${attrNameQuote}[${attrNameArr
              .map((val) => `${cssModuleName}[${strQuote}${val}${strQuote}]`)
              .join(',')}]${attrNameQuote}`
          )
        }
      }
      node.children && parseHtml(node.children, s, attrName, cssModuleName)
    }
  })
}
