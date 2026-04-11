/**
 * [INPUT]: 依赖 react 的 StrictMode、react-dom/client 的 createRoot，依赖 ./App 与全局样式。
 * [OUTPUT]: 对外提供前端挂载副作用，将 App 渲染到 #root。
 * [POS]: src 的浏览器入口文件，只负责启动 React 应用。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
