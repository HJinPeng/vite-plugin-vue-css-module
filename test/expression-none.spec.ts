import { describe, expect, test } from 'vitest'

describe('cls表达式，class空', () => {
  test('表达式1', () => {
    expect(`:cls="wrap"`).toBeCssModule(`:class="[$style[wrap]]"`)
  })
  test('表达式2', () => {
    expect(`:cls="'wrap'"`).toBeCssModule(`:class="[$style['wrap']]"`)
  })
  test('表达式3', () => {
    expect(`:cls="true && type"`).toBeCssModule(`:class="[$style[true && type]]"`)
  })
  test('表达式4', () => {
    expect(`:cls="type === 'add' ? type + '--active' : type"`).toBeCssModule(
      `:class="[$style[type === 'add' ? type + '--active' : type]]"`
    )
  })
})
