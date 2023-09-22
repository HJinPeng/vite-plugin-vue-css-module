import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vitest/config'

/**
 * 根据相对路径，将url解析为适用于操作系统的本地文件路径
 * @param url string 相对路径
 * @returns 
 */
function resolve(url: string) {
  return fileURLToPath(new URL(url, import.meta.url))
}

export default defineConfig({
  test: {
    alias: {
      '@': resolve('./src'),
      '$': resolve('./test')
    },
    setupFiles: resolve('./test/utils/setup-files.ts')
  }
})