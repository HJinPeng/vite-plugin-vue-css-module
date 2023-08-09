import { parse } from '@vue/compiler-sfc'

/**
 * 获取.vue文件中的 cssModule的值 和 template的AST
 * @param code vue文件
 * @returns Object
 */
export function parseVue(code: string) {
  const descriptor = parse(code).descriptor
  // 获取 <style module> 或 <style module="blog">的值
  const cssModule = descriptor.styles.find((style) => style.module !== undefined)?.module
  return {
    cssModule,
    template: descriptor.template
  }
}
