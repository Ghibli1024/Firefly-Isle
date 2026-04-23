/**
 * [INPUT]: 依赖 react 的 Context、hooks 与浏览器 localStorage。
 * [OUTPUT]: 对外提供 LocaleProvider、useLocale、Locale 类型与 LOCALE_STORAGE_KEY 常量。
 * [POS]: lib 的语言状态中心，统一管理 zh / en 切换、持久化与语言真相源消费入口。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

export type Locale = 'zh' | 'en'

export const LOCALE_STORAGE_KEY = 'firefly-locale'

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

function readStoredLocale(): Locale {
  if (typeof window === 'undefined') {
    return 'zh'
  }

  return window.localStorage.getItem(LOCALE_STORAGE_KEY) === 'en' ? 'en' : 'zh'
}

export function LocaleProvider({ children }: PropsWithChildren) {
  const [locale, setLocaleState] = useState<Locale>(readStoredLocale)

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale)
    window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale)
  }, [])

  const toggleLocale = useCallback(() => {
    setLocaleState((currentLocale) => {
      const nextLocale = currentLocale === 'zh' ? 'en' : 'zh'
      window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale)
      return nextLocale
    })
  }, [])

  const value = useMemo(
    () => ({ locale, setLocale, toggleLocale }),
    [locale, setLocale, toggleLocale],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const context = useContext(LocaleContext)

  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider')
  }

  return context
}
