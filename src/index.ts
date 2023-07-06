import type { Plugin } from 'vite'

import MagicString from 'magic-string'

import { getTemplateAst } from './utils/parseVue'
import { transformAttrs } from './utils/parseAttr'

import { PluginOptions } from './utils/types'
import type { ElementNode } from '@vue/compiler-core'

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
      // console.log('code', code);
      if (id.endsWith('.vue')) {
        // style标签上有module，表示开启了css-module
        if (/<style[\s\S]* module[\s\S]*>[\s\S]*<\/style>/.test(code)) {
          console.log('!!')
          const templateAst = getTemplateAst(code)
          if (!templateAst || templateAst.children?.length === 0) return
          const s = new MagicString(code)

          transformAttrs(templateAst.children as ElementNode[], s, options.attrName)

          return {
            code: s.toString(),
            map: s.generateMap()
          }
        }
      }
    }
  }
}
