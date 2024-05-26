import { describe, expect, test } from 'vitest'

describe('cls字符串，class数组', () => {
  test('表达式1', async () => {
    await expect(`:class="[]" cls="wrap"`).toBeCssModule(`:class="[$style['wrap']]"`)
  })
  test('表达式2', async () => {
    await expect(`:class="['type', type]" cls=" green "`).toBeCssModule(
      `:class="['type', type, $style['green']]"`
    )
  })
})
