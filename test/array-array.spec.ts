import { describe, expect, test } from 'vitest'

describe('cls数组，class数组', () => {
  test('表达式1', () => {
    expect(
      `:class="[type]" :cls="[item1, 'item2', true && 'item' + '3', item4 === 'item4' ? item5 : 'item6']"`
    ).toBeCssModule(
      `:class="[type, $style[item1], $style['item2'], $style[true&&'item'+'3'], $style[item4 === 'item4' ? item5 : 'item6']]"`
    )
  })
  test('表达式2', () => {
    expect(`:class="[type]" :cls="[item1, [item2, true && 'item3'], item4]"`).toBeCssModule(
      `:class="[type, $style[item1], [$style[item2], $style[true && 'item3']], $style[item4]]"`
    )
  })
  test('表达式3', () => {
    expect(
      `:class="[type]" :cls="[item1, [item2], { item3: true }, [{item4: true}]]"`
    ).toBeCssModule(
      `:class="[type, $style[item1], [$style[item2]], {[$style['item3']]: true}, [{[$style['item4']]: true}]]"`
    )
  })
})
