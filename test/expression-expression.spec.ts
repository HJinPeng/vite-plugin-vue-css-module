import { describe, expect, test } from 'vitest'

describe('cls表达式，class表达式', () => {
  test('表达式1', () => {
    expect(`:class="wrap" :cls="wrap"`).toBeCssModule(`:class="[wrap, $style[wrap]]"`)
  })
  test('表达式2', () => {
    expect(`:class="'wrap'" :cls="'wrap'"`).toBeCssModule(`:class="['wrap', $style['wrap']]"`)
  })
  test('表达式3', () => {
    expect(`:class="true && type" :cls="true && type"`).toBeCssModule(
      `:class="[true && type, $style[true && type]]"`
    )
  })
  test('表达式4', () => {
    expect(
      `:class="type === 'add' ? type + '--active' : type" :cls="type === 'add' ? type + '--active' : type"`
    ).toBeCssModule(
      `:class="[type === 'add' ? type + '--active' : type, $style[type === 'add' ? type + '--active' : type]]"`
    )
  })
})
