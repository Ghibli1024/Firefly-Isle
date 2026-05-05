# src/
> L2 | 父级: /CLAUDE.md

成员清单
CLAUDE.md: 说明前端源码层级、模块边界与文档同步规则，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
App.tsx: 路由装配入口，负责 BrowserRouter、ThemeProvider、BackgroundAudioProvider、AuthProvider、PrivacyGate、匿名/非匿名身份标记、OAuth 公共回调/错误归一与 lazy 加载的品牌锁定组合预览页及四类产品页面路由拼接，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
main.tsx: React 挂载入口，只负责把 App 渲染到 DOM，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
index.css: 全局 token、主题变量与共享布局样式，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
components/: 页面骨架、登录展示层、病例 dossier 展示层、设计系统壳层基元、主题开关与 UI 组件，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
lib/: 主题状态、背景音乐歌单状态、设计系统 token、认证、隐私文案、LLM adapter、信息提取、正式病历导出、结构债测试、Supabase 客户端与通用工具，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
routes/: 登录页、OAuth 公共回调页、隐私条款页、临床工作区、档案详情 route 编排/加载逻辑与品牌锁定组合预览页面骨架，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
styles/: Transitions.dev 可移植动效工具目录，提供 badge、dropdown、panel、resize、icon/text swap 等共享 CSS 动效合同，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
types/: PatientRecord 等领域模型与判定工具，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 壳层先于业务，主题先于页面，路由只装配不承载细节。
