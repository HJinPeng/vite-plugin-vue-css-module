import { describe, expect, test } from 'vitest'

describe('pug class literal', async () => {
  test('class literal', async () => {
    await expect(`.wrap`).toBePugCssModule(`div(':class'!="[$style['wrap']]")`)
  })
  test('multiple class literals', async () => {
    await expect(`.wrap1.wrap2`).toBePugCssModule(
      `div(':class'!="[$style['wrap1'], $style['wrap2']]")`
    )
  })
  test('class literal and normal class', async () => {
    await expect(`.wrap(class="normal")`).toBePugCssModule(`.normal(':class'!="[$style['wrap']]")`)
  })
  test('class literal and module class', async () => {
    await expect(`.wrap1(cls="wrap2")`).toBePugCssModule(
      `div(':class'!="[$style['wrap1'], $style['wrap2']]")`
    )
  })
  test('class literals, module classes and normal classes', async () => {
    await expect(`.wrap1.wrap2(class="red yellow" cls="wrap3 wrap4")`).toBePugCssModule(
      `div(':class'!="[$style['wrap1'], $style['wrap2'], $style['wrap3'], $style['wrap4']]" class!="red yellow")`
    )
  })
  test('class literals, module classes, normal classes, bind classes: class < :class < class literals < cls < :cls', async () => {
    await expect(
      `.wrap1.wrap2(class="red yellow" cls="wrap3" :class="[type]" :cls="[wrap4]")`
    ).toBePugCssModule(
      `div(class!="red yellow" ':class'!="[type, $style['wrap1'], $style['wrap2'], $style['wrap3'], $style[wrap4]]")`
    )
  })
})
