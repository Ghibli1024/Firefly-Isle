/**
 * [INPUT]: 依赖 clsx 的条件类名拼接与 tailwind-merge 的冲突合并。
 * [OUTPUT]: 对外提供 cn 类名合并函数。
 * [POS]: lib 的通用无状态工具，被 UI 基元与页面骨架共用。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
