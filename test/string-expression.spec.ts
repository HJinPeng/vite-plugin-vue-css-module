import { describe, expect, test } from 'vitest'

describe('cls字符串，class表达式', () => {
  test('表达式1', async () => {
    await expect(`:class="type" cls="wrap"`).toBeCssModule(`:class="[type, $style['wrap']]"`)
  })
  test('表达式2', async () => {
    await expect(
      `:class=" type === '1' ? type + '--active' : \`\${type + '--inactive'}\` " cls=" green "`
    ).toBeCssModule(
      `:class="[ type === '1' ? type + '--active' : \`\${type+'--inactive'}\`, $style['green']]"`
    )
  })
  test('表达式3', async () => {
    await expect(`:class="type === '1' && 'active'" cls="wrap"`).toBeCssModule(
      `:class="[type === '1' && 'active', $style['wrap']]"`
    )
  })
  test('表达式4', async () => {
    await expect(`:class="'active'" cls="wrap"`).toBeCssModule(`:class="['active', $style['wrap']]"`)
  })
})
