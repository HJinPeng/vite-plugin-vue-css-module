import { describe, expect, test } from 'vitest'

describe('cls数组，class字符串', () => {
  test('表达式1', () => {
    expect(
      `class="type1 type2" :cls="[item1, 'item2', true && 'item' + '3', item4 === 'item4' ? item5 : 'item6']"`
    ).toBeCssModule(
      `class="type1 type2" :class="[$style[item1], $style['item2'], $style[true && 'item' + '3'], $style[item4 === 'item4' ? item5 : 'item6']]"`
    )
  })
  test('表达式2', () => {
    expect(`class="type1 type2" :cls="[item1, [item2, true && 'item3'], item4]"`).toBeCssModule(
      `class="type1 type2" :class="[$style[item1], [$style[item2], $style[true && 'item3']], $style[item4]]"`
    )
  })
  test('表达式3', () => {
    expect(`class="type1 type2" :cls="[item1, [item2], { item3: true }]"`).toBeCssModule(
      `class="type1 type2" :class="[$style[item1], [$style[item2]], {[$style['item3']]: true}]"`
    )
  })
})
