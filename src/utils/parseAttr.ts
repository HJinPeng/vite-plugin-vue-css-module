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
  transformByBabel,
  transformString2ObjectString
} from './tool'

export function transformAttrs(childNode: ElementNode[], s: MagicString, attrName: string) {
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
        const bindAttrNameContent = trimString(
          (bindAttrNameNode.exp as SimpleExpressionNode).content
        )
        // 通过babel转换，将:cls=""中的类名加上$style.
        const bindAttrNameContent2$styleStr: string = transformByBabel(bindAttrNameContent)
        if (!bindAttrNameContent2$styleStr) return
        // :class exist
        if (bindClassNode) {
          const bindClassContent = trimString((bindClassNode.exp as SimpleExpressionNode).content)
          let result: string
          // :class="{}"
          if (isObjectExp(bindClassContent)) {
            // 获取{}中间的内容
            const objectContent = getObjectOrArrayExpressionContent(bindClassContent)
            // :class="{}"  :cls="{}"
            if (isObjectExp(bindAttrNameContent)) {
              result = `:class="{${objectContent},${bindAttrNameContent2$styleStr}}"`
            }
            // :class="{}"  :cls="[]" 或 :cls="exp"
            else {
              result = `:class="{${objectContent},${transformString2ObjectString(
                bindAttrNameContent2$styleStr
              )}}"`
            }
          }
          // :class="[]"
          else if (isArrayExp(bindClassContent)) {
            // 获取[]中间的内容
            const arrayContent = getObjectOrArrayExpressionContent(bindClassContent)
            // :class="[]" :cls="{}"
            if (isObjectExp(bindAttrNameContent)) {
              result = `:class="{${transformString2ObjectString(
                arrayContent
              )},${bindAttrNameContent2$styleStr}}"`
            }
            // :class="[]" :cls="[]" 或 :cls="exp"
            else {
              result = `:class="[${arrayContent},${bindAttrNameContent2$styleStr}]"`
            }
          }
          // :class="exp"
          else {
            // :class="exp" :cls="{}"
            if (isObjectExp(bindAttrNameContent)) {
              result = `:class="{${transformString2ObjectString(
                bindClassContent
              )},${bindAttrNameContent2$styleStr}}"`
            }
            // :class="exp" :cls="[]" 或 :cls="exp"
            else {
              result = `:class="[${bindClassContent},${bindAttrNameContent2$styleStr}]"`
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
              `:class="{${bindAttrNameContent2$styleStr}}"`
            )
          } else {
            s.update(
              bindAttrNameNode.loc.start.offset,
              bindAttrNameNode.loc.end.offset,
              `:class="[${bindAttrNameContent2$styleStr}]"`
            )
          }
        }
      }
      if (attrNameNode) {
        const attrNameArr = transformString2Array((attrNameNode.value as TextNode).content)
        if (attrNameArr.length === 0) return
        // :class
        if (bindClassNode) {
          const bindClassContent = trimString((bindClassNode.exp as SimpleExpressionNode).content)
          let result: string
          // :class="{}"  :class='{}'
          if (isObjectExp(bindClassContent)) {
            // 获取{}中间的内容
            const objectContent = getObjectOrArrayExpressionContent(bindClassContent)
            result = `:class="{${objectContent},${attrNameArr
              .map((val) => `[$style[\`${val}\`]]:true`)
              .join(',')}}"`
          }
          // :class="[]" :class='[]'
          else if (isArrayExp(bindClassContent)) {
            const arrayContent = getObjectOrArrayExpressionContent(bindClassContent)
            result = `:class="[${arrayContent},${attrNameArr
              .map((val) => `$style[\`${val}\`]`)
              .join(',')}]"`
          }
          // :class="type" :class='type === "add" && "red"' :class="type === 'add' ? 'red' : 'green'"
          else {
            result = `:class="[${bindClassContent},${attrNameArr
              .map((val) => `$style[\`${val}\`]`)
              .join(',')}]"`
          }
          // 修改 :class 属性
          s.update(bindClassNode.loc.start.offset, bindClassNode.loc.end.offset, result)
          // 删除 attrName 属性
          s.update(attrNameNode.loc.start.offset, attrNameNode.loc.end.offset, '')
        }
        // 只存在 或 不存在 class
        else {
          // 将 attrName 属性 改为 :class
          s.update(
            attrNameNode.loc.start.offset,
            attrNameNode.loc.end.offset,
            `:class="[${attrNameArr.map((val) => `$style[\`${val}\`]`).join(',')}]"`
          )
        }
      }
      node.children && transformAttrs(node.children as ElementNode[], s, attrName)
    }
  })
}
