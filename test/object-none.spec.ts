import { describe, expect, test } from 'vitest'

describe('cls对象，class空', () => {
  test('表达式1', async () => {
    await expect(`:cls="{item}"`).toBeCssModule(`:class="{[$style['item']]: item}"`)
  })
  test('表达式2', async () => {
    await expect(`:cls="{ item: true, item2: false }"`).toBeCssModule(
      `:class="{[$style['item']]: true,[$style['item2']]: false}"`
    )
  })
  test('表达式3', async () => {
    await expect(`:cls="{ [item]: true }"`).toBeCssModule(`:class="{[$style[[item]]]: true}"`)
  })
})
