import { describe, expect, test } from 'vitest'

describe('pug class literal', () => {
  test('class literal', () => {
    expect(`.wrap`).toBePugCssModule(`:class="[$style['wrap']]"`)
  })
  test('multiple class literals', () => {
    expect(`.wrap1.wrap2`).toBePugCssModule(`:class="[$style['wrap1'], $style['wrap2']]"`)
  })
  test('class literal and normal class', () => {
    expect(`.wrap(class="normal")`).toBePugCssModule(`class="normal" :class="[$style['wrap']]"`)
  })
  test('class literal and module class', () => {
    expect(`.wrap1(cls="wrap2")`).toBePugCssModule(`:class="[$style['wrap1'], $style['wrap2']]"`)
  })
  test('class literals, module classes and normal classes', () => {
    expect(`.wrap1.wrap2(class="red yellow" cls="wrap3 wrap4")`).toBePugCssModule(
      `class="red yellow" :class="[$style['wrap1'], $style['wrap2'], $style['wrap3'], $style['wrap4']]"`
    )
  })
  test('class literals, module classes, normal classes, bind classes: class < :class < class literals < cls < :cls', () => {
    expect(`.wrap1.wrap2(class="red yellow" cls="wrap3" :class="[type]" :cls="[wrap4]")`).toBePugCssModule(
      `class="red yellow" :class="[type, $style['wrap1'], $style['wrap2'], $style['wrap3'], $style[wrap4]]"`
    )
  })
})
