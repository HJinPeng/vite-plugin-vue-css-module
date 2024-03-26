import { expect } from 'vitest'
import { assembleVue, getTemplateCode, removeBlank, plugin } from './utils'

// 扩展 .toBeCssModule
expect.extend({
  toBeCssModule: async (received: string, expected: string) => {
    return testVue(assembleVue('html', `<div ${received}></div>`), expected)
  },
  toBePugCssModule: async (received: string, expected: string) => {
    return testVue(assembleVue('pug', received), expected)
  }
})

async function testVue(originVue: string, expected: string) {
  const { code: resultVue } = await (plugin as any).transform(originVue, 'toBeCssModule.vue')
  const resultCore = getTemplateCode(resultVue)
  const expectedCore = removeBlank(expected)
  return {
    pass: resultCore === expectedCore,
    message: () => `
      \n         full result 》 ${resultVue}
      \n            expected 》 ${expected}
      \n (no space) expected 》 ${expectedCore}
      \n   (no space) result 》 ${resultCore}
    `
  }
}
