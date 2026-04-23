/**
 * [INPUT]: 依赖 react 的 useMemo，依赖 react-router-dom 的 BrowserRouter、Routes、Route、Navigate，依赖 ThemeProvider、AuthProvider、PrivacyGate、PRIVACY_PAGE_HREF 与四类页面。
 * [OUTPUT]: 对外提供 App 组件。
 * [POS]: src 的路由装配入口，连接主题系统、隐私门控、Supabase session 持久化与 /login、/privacy、/app、/record/:id 页面。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useMemo } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { PrivacyGate } from '@/components/privacy-gate'
import { AuthProvider, useAuth } from '@/lib/auth'
import { PRIVACY_PAGE_HREF } from '@/lib/privacy'
import { ThemeProvider, useTheme } from '@/lib/theme'
import { LoginPage } from '@/routes/login-page'
import { PrivacyPage } from '@/routes/privacy-page'
import { RecordPage } from '@/routes/record-page'
import { WorkspacePage } from '@/routes/workspace-page'

function AppBootScreen() {
  const { theme } = useTheme()

  return theme === 'dark' ? (
    <div className="flex min-h-screen items-center justify-center bg-[var(--ff-surface-base)] px-6 text-[var(--ff-text-primary)]">
      <div className="border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] px-8 py-6 text-center">
        <div className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.4em] text-[var(--ff-accent-primary)]">
          Session Restore
        </div>
        <div className="mt-3 font-['Inter_Tight'] text-2xl font-black tracking-tight">正在恢复访问状态</div>
      </div>
    </div>
  ) : (
    <div className="flex min-h-screen items-center justify-center bg-[var(--ff-surface-base)] px-6 text-[var(--ff-text-primary)]">
      <div className="ff-light-ink-shadow border-2 border-[var(--ff-border-default)] bg-[var(--ff-surface-paper)] px-8 py-6 text-center">
        <div className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.4em] text-[var(--ff-text-muted)]">
          Session Restore
        </div>
        <div className="mt-3 font-['Playfair_Display'] text-3xl font-black tracking-tight">正在恢复访问状态</div>
      </div>
    </div>
  )
}

function AppRoutes() {
  const { authError, isAuthenticated, isAuthReady, isSigningOut, signOut, user } = useAuth()
  const userLabel = useMemo(() => {
    if (!user) {
      return undefined
    }

    return user.is_anonymous ? 'ANON_SESSION' : user.email ?? 'AUTH_SESSION'
  }, [user])

  if (!isAuthReady) {
    return <AppBootScreen />
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate replace to={isAuthenticated ? '/app' : '/login'} />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate replace to="/app" /> : <LoginPage authError={authError} />}
      />
      <Route
        path={PRIVACY_PAGE_HREF}
        element={<PrivacyPage />}
      />
      <Route
        path="/app"
        element={
          isAuthenticated ? (
            <WorkspacePage isSigningOut={isSigningOut} onSignOut={signOut} userLabel={userLabel} />
          ) : (
            <Navigate replace to="/login" />
          )
        }
      />
      <Route
        path="/record/:id"
        element={
          isAuthenticated ? (
            <RecordPage isSigningOut={isSigningOut} onSignOut={signOut} userLabel={userLabel} />
          ) : (
            <Navigate replace to="/login" />
          )
        }
      />
      <Route path="*" element={<Navigate replace to={isAuthenticated ? '/app' : '/login'} />} />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <PrivacyGate>
            <AppRoutes />
          </PrivacyGate>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
