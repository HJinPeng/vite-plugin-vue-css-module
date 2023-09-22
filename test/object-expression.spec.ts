import { describe, expect, test } from 'vitest'

describe('cls对象，class表达式', () => {
  test('表达式1', () => {
    expect(`:class="type1" :cls="{item}"`).toBeCssModule(
      `:class="{[type1]: type1, [$style['item']]: item}"`
    )
  })
  test('表达式2', () => {
    expect(`:class="true && type1" :cls="{ item: true, item2: false }"`).toBeCssModule(
      `:class="{[true && type1]: true && type1, [$style['item']]: true, [$style['item2']]: false}"`
    )
  })
  test('表达式3', () => {
    expect(`:class="1 + 1 === 2 ? type1 : 'type2'" :cls="{ [item]: true }"`).toBeCssModule(
      `:class="{[1 + 1 === 2 ? type1 : 'type2']: 1 + 1 === 2 ? type1 : 'type2', [$style[[item]]]: true}"`
    )
  })
})
