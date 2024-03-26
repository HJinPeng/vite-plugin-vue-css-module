import { describe, expect, test } from 'vitest'

describe('cls字符串，class空', () => {
  test('单个', async () => {
    await expect(`cls="wrap"`).toBeCssModule(`:class="[$style['wrap']]"`)
  })
  test('多个', async () => {
    await expect(`cls="red yellow green"`).toBeCssModule(
      `:class="[$style['red'], $style['yellow'], $style['green']]"`
    )
  })
})
