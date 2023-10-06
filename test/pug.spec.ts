import { describe, expect, test } from 'vitest'

describe('pug string', () => {
  test('single module class', () => {
    expect(`div(cls="wrap")`).toBePugCssModule(`:class="[$style['wrap']]"`)
  })
  test('multiple module classes', () => {
    expect(`div(cls="wrap1 wrap2")`).toBePugCssModule(`:class="[$style['wrap1'], $style['wrap2']]"`)
  })
  test('multiple module classes and multiple normal classes', () => {
    expect(`div(class="red yellow" cls="green red")`).toBePugCssModule(
      `class="red yellow" :class="[$style['green'], $style['red']]"`
    )
  })
  test('normal classes, module classes and bind classes: class < :class < cls', () => {
    expect(`div(class="red yellow" cls="wrap" :class="[type]")`).toBePugCssModule(
      `class="red yellow" :class="[type, $style['wrap']]"`
    )
  })
  test('normal classes, bind module classes and bind classes: class < :class < :cls', () => {
    expect(`div(class="red yellow" :cls="{wrap: true}" :class="[type]")`).toBePugCssModule(
      `class="red yellow" :class="{ [type]: type, [$style['wrap']]: true}"`
    )
  })

  test('normal classes, module classes, bind module classes and bind classes: class < :class < cls < :cls', () => {
    expect(`div(class="red yellow" cls="green" :cls="{wrap: true}" :class="[type]")`).toBePugCssModule(
      `class="red yellow" :class="{ [type]: type, [$style['green']]: $style['green'], [$style['wrap']]: true}"`
    )
  })

})
