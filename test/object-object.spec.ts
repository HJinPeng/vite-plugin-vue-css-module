import { describe, expect, test } from 'vitest'

describe('cls对象，class对象', () => {
  test('表达式1', async () => {
    await expect(`:class="{type: type === 'add'}" :cls="{item}"`).toBeCssModule(
      `:class="{ type: type === 'add', [$style['item']]: item}"`
    )
  })
  test('表达式2', async () => {
    await expect(`:class="{type: type === 'add'}" :cls="{ item: true, item2: false }"`).toBeCssModule(
      `:class="{type: type === 'add', [$style['item']]: true,[$style['item2']]: false}"`
    )
  })
  test('表达式3', async () => {
    await expect(`:class="{type: type === 'add'}" :cls="{ [item]: true }"`).toBeCssModule(
      `:class="{type: type === 'add', [$style[[item]]]: true}"`
    )
  })
})
