import type { Plugin } from 'vite'
import type { PluginOptions } from './utils/types'
import MagicString from 'magic-string'
import { parseVue } from './utils/parseVue'
import { parseHtml } from './utils/parseHtml'
import { parsePug } from './utils/parsePug'
import { isLegalVariate } from './utils/tool'

export default function vueCssModule(userOptions: Partial<PluginOptions> = {}): Plugin {
  const options = {
    attrName: 'cls', // 默认属性名
    pugClassLiterals: false,
    ...userOptions
  }
  return {
    name: 'vite-plugin-vue-css-module',
    enforce: 'pre',
    async transform(code: string, id: string) {
      if (id.endsWith('.vue')) {
        // style标签上有module，表示开启了css-module
        const { cssModule, template } = parseVue(code)
        if (cssModule && template && template.content) {
          const { ast: templateAst, content: templateContent, lang } = template
          const cssModuleName = cssModule === true ? '$style' : cssModule
          // cssModuleName 需要是合法变量名
          if (!isLegalVariate(cssModuleName)) {
            throw new Error(`module的值不能是${cssModuleName}，它必须是一个合法变量名`)
          }
          const s = new MagicString(code)

          if (!templateAst || templateAst.children.length === 0) {
            return 
          }

          if (lang === 'pug') {
            const templateOffset = [template.loc.start.offset, template.loc.end.offset]
            const result = await parsePug(templateContent, options, cssModuleName)
            // 将pug模板中的属性为 attrName 的值转为 cssModule写法，转为html模板
            s.update(templateOffset[0], templateOffset[1], result)
            return {
              code: s.toString(),
              map: s.generateMap()
            }
          }

          parseHtml(templateAst.children, s, options.attrName, cssModuleName)
          return {
            code: s.toString(),
            map: s.generateMap()
          }
        }
      }
    }
  }
}
