/**
 * [INPUT]: 依赖 react 的 useSyncExternalStore/useCallback
 * [OUTPUT]: 对外提供 useTheme hook (theme, toggleTheme, isDark)
 * [POS]: hooks/ 的主题状态管理器，单一真相源，所有消费者共享同一状态
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useSyncExternalStore, useCallback } from 'react'

/* ========================================================================
   常量
   ======================================================================== */

const STORAGE_KEY = 'firefly-isle-theme'
const DARK = 'dark'
const LIGHT = 'light'

/* ========================================================================
   外部状态存储 - 单一真相源
   ======================================================================== */

const listeners = new Set()

function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === DARK || stored === LIGHT) return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK : LIGHT
}

let currentTheme = getInitialTheme()

/* 初始化 DOM 状态 */
document.documentElement.classList.toggle(DARK, currentTheme === DARK)

function applyTheme(next) {
  currentTheme = next
  document.documentElement.classList.toggle(DARK, next === DARK)
  localStorage.setItem(STORAGE_KEY, next)
  listeners.forEach(fn => fn())
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return currentTheme
}

/* ========================================================================
   useTheme - 主题状态管理
   ======================================================================== */

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot)
  const toggleTheme = useCallback(() => applyTheme(theme === DARK ? LIGHT : DARK), [theme])
  const isDark = theme === DARK

  return { theme, toggleTheme, isDark }
}
