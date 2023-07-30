import type {
  AttributeNode,
  DirectiveNode,
  SimpleExpressionNode,
  TextNode,
  ElementNode
} from '@vue/compiler-core'
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

export function transformAttrs(
  childNode: ElementNode[],
  s: MagicString,
  attrName: string,
  cssModuleName: string
) {
  childNode.forEach((node) => {
    if (node.props) {
      let bindClassNode: DirectiveNode | undefined,
        attrNameNode: AttributeNode | undefined,
        bindAttrNameNode: DirectiveNode | undefined
      node.props.forEach((prop) => {
        // :class
        if (
          prop.name === 'bind' &&
          ((prop as DirectiveNode).arg as SimpleExpressionNode).content === 'class'
        ) {
          bindClassNode = prop as DirectiveNode
        }
        // if attrName = cls, then cls=""
        else if (prop.name === attrName) {
          attrNameNode = prop as AttributeNode
        }
        // if attrName = cls, then :cls=""
        else if (
          prop.name === 'bind' &&
          ((prop as DirectiveNode).arg as SimpleExpressionNode).content === attrName
        ) {
          bindAttrNameNode = prop as DirectiveNode
        }
      })
      // if attrName = cls, and :cls="" exist
      if (bindAttrNameNode) {
        // :cls='' -> '   :cls="" -> "
        const bindAttrNameQuote = getQuote(bindAttrNameNode.loc.source)
        const bindAttrNameContent = trimString(
          (bindAttrNameNode.exp as SimpleExpressionNode).content
        )
        // 将:cls=""中的类名加上cssModuleName.
        let bindAttrNameContent2CssModuleNameStr: string = transformExp(
          bindAttrNameContent,
          cssModuleName
        )
        if (!bindAttrNameContent2CssModuleNameStr) return
        // :class exist
        if (bindClassNode) {
          const bindClassQuote = getQuote(bindClassNode.loc.source)
          const bindClassContent = trimString((bindClassNode.exp as SimpleExpressionNode).content)
          // :class 和 :cls 用的引号不一致（源代码不规范的情况可能出现）
          if (bindAttrNameQuote !== bindClassQuote) {
            bindAttrNameContent2CssModuleNameStr = swapQuotes(bindAttrNameContent2CssModuleNameStr)
          }
          let result: string
          // :class="{}"
          if (isObjectExp(bindClassContent)) {
            // 获取{}中间的内容
            const objectContent = getObjectOrArrayExpressionContent(bindClassContent)
            // :class="{}"  :cls="{}"
            if (isObjectExp(bindAttrNameContent)) {
              result = `:class=${bindClassQuote}{${objectContent},${bindAttrNameContent2CssModuleNameStr}}${bindClassQuote}`
            }
            // :class="{}"  :cls="[]" 或 :cls="exp"
            else {
              result = `:class=${bindClassQuote}{${objectContent},${transformString2ObjectString(
                bindAttrNameContent2CssModuleNameStr
              )}}${bindClassQuote}`
            }
          }
          // :class="[]"
          else if (isArrayExp(bindClassContent)) {
            // 获取[]中间的内容
            const arrayContent = getObjectOrArrayExpressionContent(bindClassContent)
            // :class="[]" :cls="{}"
            if (isObjectExp(bindAttrNameContent)) {
              result = `:class=${bindClassQuote}{${transformString2ObjectString(
                arrayContent
              )},${bindAttrNameContent2CssModuleNameStr}}${bindClassQuote}`
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
                bindClassContent
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
        let attrNameArr = transformString2Array((attrNameNode.value as TextNode).content)
        if (attrNameArr.length === 0) return
        // :class
        if (bindClassNode) {
          const bindClassQuote = getQuote(bindClassNode.loc.source)
          const strQuote = bindClassQuote === "'" ? '"' : "'"
          const bindClassContent = trimString((bindClassNode.exp as SimpleExpressionNode).content)

          let result: string
          // :class="{}"  :class='{}'
          if (isObjectExp(bindClassContent)) {
            // 获取{}中间的内容
            const objectContent = getObjectOrArrayExpressionContent(bindClassContent)
            result = `:class=${bindClassQuote}{${objectContent},${attrNameArr
              .map((val) => `[${cssModuleName}[${strQuote}${val}${strQuote}]]:true`)
              .join(',')}}${bindClassQuote}`
          }
          // :class="[]" :class='[]'
          else if (isArrayExp(bindClassContent)) {
            const arrayContent = getObjectOrArrayExpressionContent(bindClassContent)
            result = `:class=${bindClassQuote}[${arrayContent},${attrNameArr
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
      node.children && transformAttrs(node.children as ElementNode[], s, attrName, cssModuleName)
    }
  })
}
