import { describe, expect, test } from 'vitest'

describe('cls表达式，class字符串', () => {
  test('表达式1', async () => {
    await expect(`class="type1 type2" :cls="wrap"`).toBeCssModule(
      `class="type1 type2" :class="[$style[wrap]]"`
    )
  })
  test('表达式2', async () => {
    await expect(`class="type1 type2" :cls="'wrap'"`).toBeCssModule(
      `class="type1 type2" :class="[$style['wrap']]"`
    )
  })
  test('表达式3', async () => {
    await expect(`class="type1 type2" :cls="true && type"`).toBeCssModule(
      `class="type1 type2" :class="[$style[true && type]]"`
    )
  })
  test('表达式4', async () => {
    await expect(`class="type1 type2" :cls="type === 'add' ? type + '--active' : type"`).toBeCssModule(
      `class="type1 type2" :class="[$style[type === 'add' ? type + '--active' : type]]"`
    )
  })
})
