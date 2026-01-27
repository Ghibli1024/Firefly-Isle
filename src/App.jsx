/**
 * [INPUT]: 依赖 react-router-dom 的 BrowserRouter/Routes/Route
 * [INPUT]: 依赖 @/components/layout 的 Header/Footer
 * [INPUT]: 依赖 @/pages 的 HomePage/DesignSystemPage
 * [OUTPUT]: 对外提供 App 根组件
 * [POS]: src/ 的应用根组件，承载全局布局与路由
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Header, Footer } from '@/components/layout'
import { HomePage, DesignSystemPage } from '@/pages'

/* ========================================================================
   App - 应用根组件
   ======================================================================== */

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Header />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/design-system" element={<DesignSystemPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
