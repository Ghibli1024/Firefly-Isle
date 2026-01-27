/**
 * [INPUT]: 依赖 react-dom/client 的 createRoot，依赖 ./App 的根组件，依赖 ./index.css 的全局样式
 * [OUTPUT]: 对外提供 React 应用挂载点
 * [POS]: src/ 的入口文件，将 App 组件渲染到 DOM
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
