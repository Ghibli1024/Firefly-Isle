/**
 * [INPUT]: 依赖 ./HomePage, ./DesignSystemPage 页面组件
 * [OUTPUT]: 统一导出 HomePage, DesignSystemPage
 * [POS]: pages/ 的模块出口，聚合所有页面组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export { default as HomePage } from './HomePage'
export { default as DesignSystemPage } from './DesignSystemPage'
