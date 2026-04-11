/**
 * [INPUT]: 依赖 react-router-dom 的 BrowserRouter、Routes、Route、Navigate，依赖 @/lib/theme 的 ThemeProvider，依赖三类页面骨架。
 * [OUTPUT]: 对外提供 App 组件。
 * [POS]: src 的路由装配入口，连接主题系统与 /login、/app、/record/:id 页面。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { ThemeProvider } from '@/lib/theme'
import { LoginPage } from '@/routes/login-page'
import { RecordPage } from '@/routes/record-page'
import { WorkspacePage } from '@/routes/workspace-page'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate replace to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/app" element={<WorkspacePage />} />
          <Route path="/record/:id" element={<RecordPage />} />
          <Route path="*" element={<Navigate replace to="/login" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
