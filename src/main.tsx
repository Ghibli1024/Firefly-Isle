/**
 * [INPUT]: 依赖 react 的 StrictMode、react-dom/client 的 createRoot，依赖 @fontsource latin 子集自托管字体 CSS、./App 与全局样式。
 * [OUTPUT]: 对外提供前端挂载副作用，将 App 渲染到 #root。
 * [POS]: src 的浏览器入口文件，只负责启动 React 应用。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource/fraunces/latin-600.css'
import '@fontsource/fraunces/latin-700.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import '@fontsource/ibm-plex-mono/latin-500.css'
import '@fontsource/ibm-plex-mono/latin-600.css'

import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
