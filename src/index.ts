import type { Plugin } from 'vite'
import type { ElementNode } from '@vue/compiler-core'
import type { PluginOptions } from './utils/types'
import MagicString from 'magic-string'
import { parseVue2Ast } from './utils/parseVue'
import { transformAttrs } from './utils/parseAttr'
import { isLegalVariate } from './utils/tool'

// 默认配置
const defaultOptions: Partial<PluginOptions> = {
  attrName: 'cls'
}

export default function vueCssModule(userOptions: Partial<PluginOptions> = {}): Plugin {
  const options = {
    ...defaultOptions,
    ...userOptions
  } as PluginOptions
  return {
    name: 'vite-plugin-vue-css-module',
    enforce: 'pre',
    async transform(code: string, id: string) {
      if (id.endsWith('.vue') && id.includes('App')) {
        // style标签上有module，表示开启了css-module
        const { cssModule, templateAst } = parseVue2Ast(code)
        if (cssModule) {
          const cssModuleName = cssModule === true ? '$style' : cssModule
          // cssModuleName 需要是合法变量名
          if (!isLegalVariate(cssModuleName)) {
            throw new Error(`module的值不能是${cssModuleName}，它必须是一个合法变量名`)
          }
          // 没有 template 则不处理
          if (!templateAst || templateAst.children?.length === 0) return
          const s = new MagicString(code)
          transformAttrs(templateAst.children as ElementNode[], s, options.attrName, cssModuleName)
          return {
            code: s.toString(),
            map: s.generateMap()
          }
        }
      }
    }
  }
}
