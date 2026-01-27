/**
 * [INPUT]: 依赖 ./Header, ./Hero, ./Footer 布局组件
 * [OUTPUT]: 统一导出 Header, Hero, Footer
 * [POS]: layout/ 的模块出口，聚合所有布局组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export { default as Header } from './Header'
export { default as Hero } from './Hero'
export { default as Footer } from './Footer'
