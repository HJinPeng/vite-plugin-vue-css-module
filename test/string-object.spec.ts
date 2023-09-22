import { describe, expect, test } from 'vitest'

describe('cls字符串，class对象', () => {
  test('表达式1', () => {
    expect(`:class="{}" cls="wrap"`).toBeCssModule(`:class="{[$style['wrap']]: true}"`)
  })
  test('表达式2', () => {
    expect(`:class="{ type: type === 'add', [type]: true, }" cls=" green "`).toBeCssModule(
      `:class="{ type: type === 'add', [type]:true, [$style['green']]: true}"`
    )
  })
})
