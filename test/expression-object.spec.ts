import { describe, expect, test } from 'vitest'

describe('cls表达式，class对象', () => {
  test('表达式1', () => {
    expect(`:class="{ type: true, item }" :cls="wrap"`).toBeCssModule(
      `:class="{ type: true, item, [$style[wrap]]: $style[wrap]}"`
    )
  })
  test('表达式2', () => {
    expect(`:class="{ type: true, item }" :cls="'wrap'"`).toBeCssModule(
      `:class="{ type: true, item, [$style['wrap']]: $style['wrap']}"`
    )
  })
  test('表达式3', () => {
    expect(`:class="{ type: true, item }" :cls="true && type"`).toBeCssModule(
      `:class="{ type: true, item, [$style[true && type]]: $style[true && type]}"`
    )
  })
  test('表达式4', () => {
    expect(
      `:class="{ type: true, item }" :cls="type === 'add' ? type + '--active' : type"`
    ).toBeCssModule(
      `:class="{type: true, item, [$style[type ==='add' ? type + '--active' : type]]: $style[type === 'add' ? type + '--active' : type]}"`
    )
  })
})
