import { readFileSync, writeFileSync } from 'fs'
import vueCssModule from '@/index'

export const plugin = vueCssModule({
  attrName: 'cls',
  pugClassLiterals: true
})

/**
 * 将源文件中的cssModule语法糖转换为正常类名，并生成文件
 * @param originUrl 源文件地址
 * @param targeUrl 目标文件地址
 */
export async function generateResultFile(originUrl: string, targeUrl: string) {
  const originVue = readFileSync(originUrl).toString()
  const { code: resultVue } = await (plugin as any).transform(originVue, originUrl)
  writeFileSync(targeUrl, resultVue)
}

/**
 * 生成style标签
 * @param module cssModule模块名
 * @returns
 */
function assembleStyle(module?: string) {
  return module ? `<style module='${module}'>.style{}</style>` : `<style module>.style{}</style>`
}

/**
 * 组装vue组件
 * @param code dom元素
 * @param module cssModule模块名
 * @returns vue组件
 */
export function assembleVue(lang: 'html' | 'pug', code: string, module?: string) {
  let template = `<template lang="${lang}">${code}</template>`
  let style = assembleStyle(module)
  return template + style
}

/**
 * 移除所有空格
 * @param code
 * @returns
 */
export function removeBlank(code: string) {
  return code.replaceAll(' ', '')
}

/**
 * 移除 class 外的所有字符串，仅保留 class部分
 * @param code
 * @param module
 * @returns
 */
export function getTemplateCode(code: string) {
  // For HTML templates, return the template div attributes (for historical reasons)
  // For Pug templates, return the full template
  return code.replace(/.*<template.*?>(?:<div )?(.*?)(?:><\/div>)?<\/template>.*/, '$1')
}
