import { describe, expect, test } from 'vitest'

describe('cls表达式，class数组', () => {
  test('表达式1', async () => {
    await expect(`:class="[wrap, 'wrap2']" :cls="wrap"`).toBeCssModule(
      `:class="[wrap, 'wrap2', $style[wrap]]"`
    )
  })
  test('表达式2', async () => {
    await expect(`:class="['wrap']" :cls="'wrap'"`).toBeCssModule(`:class="['wrap', $style['wrap']]"`)
  })
  test('表达式3', async () => {
    await expect(`:class="[true && type]" :cls="true && type"`).toBeCssModule(
      `:class="[true && type, $style[true && type]]"`
    )
  })
  test('表达式4', async () => {
    await expect(
      `:class="[type === 'add' ? type + '--active' : type]" :cls="type === 'add' ? type + '--active' : type"`
    ).toBeCssModule(
      `:class="[type === 'add' ? type + '--active' : type, $style[type === 'add' ? type + '--active' : type]]"`
    )
  })
})
