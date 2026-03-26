# Firefly Isle - 肿瘤治疗时间线与记录构建器
React 19 + Vite 7 + TailwindCSS 4 + shadcn/ui + Framer Motion

## 设计系统

### 核心原则
**微拟物光影质感 = 渐变背景 + 立体阴影 + 微交互**

### 设计公式
```css
/* 渐变背景 */
background: linear-gradient(135deg, var(--primary) 0%, color-mix(...) 50%, color-mix(...) 100%);

/* 三层阴影 */
box-shadow: 外投影, inset 顶部高光, inset 底部暗边;

/* 微交互 */
hover: scale(1.02); active: scale(0.97);
```

### 圆角规范
sm: 16px | default: 20px | lg: 24px | xl: 32px

### 禁止事项
- backdrop-blur 毛玻璃
- 0 0 Npx 发光扩散阴影
- 硬编码颜色值

### 必须遵循
- 全部使用 CSS 变量 + color-mix
- 三层阴影结构
- 一切设计必须来自设计系统的颜色和组件

<directory>
src/           - 源代码根目录 (5子目录: components, pages, hooks, lib, assets)
public/        - 静态资源 (favicon, 公共图片)
</directory>

<config>
vite.config.js   - Vite 构建配置，含 React 插件 + Tailwind 插件 + @ 路径别名
jsconfig.json    - 路径别名配置，@ 映射到 src/
components.json  - shadcn/ui 配置
index.html       - SPA 入口 HTML 模板
package.json     - 依赖清单与 npm 脚本
</config>

<tech_stack>
核心框架: React 19.2 + ReactDOM + React Router DOM
构建工具: Vite 7.3
样式方案: TailwindCSS 4.1 (@tailwindcss/vite 插件)
UI 组件: shadcn/ui (Vercel 主题) + 微拟物光影质感升级
动效库:   Framer Motion 12.x + GSAP
WebGL:    OGL (光线/线条特效)
图标库:   Lucide React
工具函数: clsx + tailwind-merge + class-variance-authority
</tech_stack>

<commands>
npm run dev      - 启动开发服务器 (http://localhost:5173)
npm run build    - 生产构建
npm run preview  - 预览生产构建
</commands>

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
