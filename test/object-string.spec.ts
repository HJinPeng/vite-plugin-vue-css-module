import { describe, expect, test } from 'vitest'

describe('cls对象，class字符串', () => {
  test('表达式1', async () => {
    await expect(`class="type1 type2" :cls="{item}"`).toBeCssModule(
      `class="type1 type2" :class="{[$style['item']]: item}"`
    )
  })
  test('表达式2', async () => {
    await expect(`class="type1 type2" :cls="{ item: true, item2: false }"`).toBeCssModule(
      `class="type1 type2" :class="{[$style['item']]: true, [$style['item2']]: false}"`
    )
  })
  test('表达式3', async () => {
    await expect(`class="type1 type2" :cls="{ [item]: true }"`).toBeCssModule(
      `class="type1 type2" :class="{[$style[[item]]]: true}"`
    )
  })
})
