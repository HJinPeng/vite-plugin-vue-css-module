import type { Plugin } from 'vite'
import type { PluginOptions } from './utils/types'
import { MagicString, type SFCTemplateBlock } from 'vue/compiler-sfc'
import { parseVue } from './utils/parseVue'
import { parseHtml } from './utils/parseHtml'
import { parsePug } from './utils/parsePug'

export default function vueCssModule(userOptions: Partial<PluginOptions> = {}): Plugin {
  const options = {
    attrName: 'cls', // 默认属性名
    pugClassLiterals: false,
    ...userOptions
  }

  const cache = new Map<
    string,
    {
      code: string
      template: SFCTemplateBlock | null
      cssModule?: string | boolean
      mustTransform?: boolean
    }
  >()

  async function transformTemplate({
    code,
    template,
    cssModule
  }: {
    code: string
    template: SFCTemplateBlock
    cssModule: string | true
  }) {
    const cssModuleName = cssModule === true ? '$style' : cssModule
    const s = new MagicString(code)

    if (template.lang === 'pug') {
      const result = await parsePug(template.content, options, cssModuleName)
      s.update(template.loc.start.offset, template.loc.end.offset, result)
      return s
    } else if (template.ast?.children.length) {
      parseHtml(template.ast.children, s, options.attrName, cssModuleName)
      return s
    }
  }

  return {
    name: 'vite-plugin-vue-css-module',
    enforce: 'pre',
    async transform(code: string, id: string) {
      const [file, queryString] = id.split('?')
      if (file.endsWith('.vue')) {
        const params = new URLSearchParams(queryString)
        const type = params.get('type')
        if (id === file) {
          // Full SFC transform
          const cached = cache.get(file)
          const { template, cssModule } = cached?.code === code ? cached : parseVue(code)
          cache.set(file, { code, template, cssModule })
          if (template && cssModule) {
            const s = await transformTemplate({ code, template, cssModule })
            if (s) {
              return { code: s.toString(), map: s.generateMap() }
            }
          }
        } else if (type === 'template') {
          // Template transform (for HMR)
          const cached = cache.get(file)
          if (cached?.mustTransform) {
            cached.mustTransform = false
            const { code, template, cssModule } = cached
            if (template && cssModule) {
              const s0 = await transformTemplate({ code, template, cssModule })
              if (s0) {
                const s = s0.snip(template.loc.start.offset, template.loc.end.offset)
                return { code: s.toString(), map: s.generateMap() }
              }
            }
          }
        }
      }
    },
    async handleHotUpdate({ file, read }) {
      if (file.endsWith('.vue')) {
        const cached = cache.get(file)
        if (cached) {
          const code = await read()
          const { template, cssModule } = parseVue(code)
          if (template) {
            const mustTransform = !(
              cached.template &&
              cached.template.content === template.content &&
              cached.template.lang === template.lang &&
              cached.cssModule === cssModule
            )
            cache.set(file, { code, template, cssModule, mustTransform })
          }
        }
      }
    }
  }
}
