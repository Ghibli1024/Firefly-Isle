# Firefly Isle - 肿瘤治疗时间线与记录构建器
React 19 + Vite 7 + TailwindCSS 4 + Framer Motion

<directory>
src/           - 源代码根目录 (4子目录: components, hooks, utils, assets)
public/        - 静态资源 (favicon, 公共图片)
</directory>

<config>
vite.config.js   - Vite 构建配置，含 React 插件 + Tailwind 插件 + @ 路径别名
jsconfig.json    - 路径别名配置，@ 映射到 src/
index.html       - SPA 入口 HTML 模板
package.json     - 依赖清单与 npm 脚本
</config>

<tech_stack>
核心框架: React 19.2 + ReactDOM
构建工具: Vite 7.3
样式方案: TailwindCSS 4.1 (@tailwindcss/vite 插件)
动效库:   Framer Motion 12.x
图标库:   Lucide React (系统图标) + React Icons (社媒图标)
工具函数: clsx (类名合并) + tailwind-variants (变体样式)
</tech_stack>

<commands>
npm run dev      - 启动开发服务器 (http://localhost:5173)
npm run build    - 生产构建
npm run preview  - 预览生产构建
</commands>

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
