import { describe, expect, test } from 'vitest'

describe('pug string', () => {
  test('single module class', () => {
    expect(`div(cls="wrap")`).toBePugCssModule(`:class="[$style['wrap']]"`)
  })
  test('multiple module classes', () => {
    expect(`div(cls="wrap1 wrap2")`).toBePugCssModule(`:class="[$style['wrap1'], $style['wrap2']]"`)
  })
  test('多个', () => {
    expect(`div(class="red yellow" cls="green red")`).toBePugCssModule(
      `class="red yellow":class="[$style['green'], $style['red']]"`
    )
  })
})
