import { describe, expect, test } from 'vitest'

describe('cls数组，class表达式', () => {
  test('表达式1', async () => {
    await expect(
      `:class="type" :cls="[item1, 'item2', true && 'item' + '3', item4 === 'item4' ? item5 : 'item6']"`
    ).toBeCssModule(
      `:class="[type, $style[item1], $style['item2'], $style[true && 'item' + '3'], $style[item4 === 'item4' ? item5 : 'item6']]"`
    )
  })
  test('表达式2', async () => {
    await expect(`:class="true && type" :cls="[item1, [item2, true && 'item3'], item4]"`).toBeCssModule(
      `:class="[true && type, $style[item1], [$style[item2], $style[true && 'item3']], $style[item4]]"`
    )
  })
  test('表达式3', async () => {
    await expect(
      `:class="1 + 1 === 2 ? type1 : type2" :cls="[item1, [item2], { item3: true }]"`
    ).toBeCssModule(
      `:class="[1 + 1 === 2 ? type1 : type2, $style[item1], [$style[item2]], {[$style['item3']]: true}]"`
    )
  })
})
