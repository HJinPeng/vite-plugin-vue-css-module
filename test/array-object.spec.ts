import { describe, expect, test } from 'vitest'

describe('cls数组，class对象', () => {
  test('表达式1', () => {
    expect(
      `:class="{type}" :cls="[item1, 'item2', true && 'item' + '3', item4 === 'item4' ? item5 : 'item6']"`
    ).toBeCssModule(
      `:class="{type, [$style[item1]]: $style[item1], [$style['item2']]: $style['item2'], [$style[true && 'item'+'3']]: $style[true && 'item'+'3'], [$style[item4 === 'item4' ? item5 : 'item6']]: $style[item4 === 'item4' ? item5 : 'item6']}"`
    )
  })
  test('表达式2', () => {
    expect(
      `:class='{type: true}' :cls="[[item0, item1], [item2, true && 'item33'], item4]"`
    ).toBeCssModule(
      `:class='{type:true, [$style[item0]]: $style[item0], [$style[item1]]: $style[item1], [$style[item2]]: $style[item2], [$style[true && "item33"]]: $style[true && "item33"], [$style[item4]]: $style[item4]}'`
    )
  })
  test('表达式3', () => {
    expect(
      `:class="{[type]: true}" :cls='["item1", [item2, item3, {item4: true}], { item5: true }]'`
    ).toBeCssModule(
      `:class="{[type]: true, [$style['item1']]: $style['item1'], [$style[item2]]: $style[item2], [$style[item3]]: $style[item3], [$style['item4']]: true, [$style['item5']]: true}"`
    )
  })
})
