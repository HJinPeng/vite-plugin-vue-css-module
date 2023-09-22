import { expect } from 'vitest'
import { assembleVue, removeNonCoreCode, removeBlank, plugin } from './utils'

// 扩展 .toBeCssModule
expect.extend({
  toBeCssModule: async (received: string, expected: string) => {
    const originVue = assembleVue(received)
    const { code: resultVue } = await (plugin as any).transform(originVue, 'toBeCssModule.vue')
    const resultCore = removeNonCoreCode(resultVue)
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
})
