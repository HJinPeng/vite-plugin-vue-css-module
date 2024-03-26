import { describe, expect, test } from 'vitest'

describe('pug string', async () => {
  test('single module class', async () => {
    await expect(`div(cls="wrap")`).toBePugCssModule(`div(':class'!="[$style['wrap']]")`)
  })
  test('multiple module classes', async () => {
    await expect(`div(cls="wrap1 wrap2")`).toBePugCssModule(
      `div(':class'!="[$style['wrap1'], $style['wrap2']]")`
    )
  })
  test('multiple module classes and multiple normal classes', async () => {
    await expect(`div(class="red yellow" cls="green red")`).toBePugCssModule(
      `div(class!="red yellow" ':class'!="[$style['green'], $style['red']]")`
    )
  })
  test('normal classes, module classes and bind classes: class < :class < cls', async () => {
    await expect(`div(class="red yellow" cls="wrap" :class="[type]")`).toBePugCssModule(
      `div(class!="red yellow" ':class'!="[type, $style['wrap']]")`
    )
  })
  test('normal classes, bind module classes and bind classes: class < :class < :cls', async () => {
    await expect(`div(class="red yellow" :cls="{wrap: true}" :class="[type]")`).toBePugCssModule(
      `div(class!="red yellow" ':class'!="{ [type]: type, [$style['wrap']]: true}")`
    )
  })
  test('normal classes, module classes, bind module classes and bind classes: class < :class < cls < :cls', async () => {
    await expect(
      `div(class="red yellow" cls="green" :cls="{wrap: true}" :class="[type]")`
    ).toBePugCssModule(
      `div(class!="red yellow" ':class'!="{ [type]: type, [$style['green']]: $style['green'], [$style['wrap']]: true}")`
    )
  })
})
