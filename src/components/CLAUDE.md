# src/components/
> L2 | 父级: /src/CLAUDE.md

成员清单
CLAUDE.md: 说明页面骨架组件与共享交互组件职责，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
app-shell.tsx: Dark/Light 共享壳层入口，导出 V3 顶部状态条、可变侧栏、主题切换、认证出口与占位素材，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
login-page-view.tsx: 登录页纯展示层，按 V3 全视口双面板复刻品牌入口、位图人体背景、能力卡、运行状态与身份访问控制台，不直接触碰 Supabase 认证状态，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
login-page-view.test.tsx: 登录页主题壳层回归测试，约束入口页不混入工作区侧栏、点阵背景、旧固定宽画布、使用稳定响应式锚点的位图人体背景而非 SVG 背景、已移除协议标签，并保持主题切换顺序，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
privacy-gate.tsx: 首次使用隐私门控层，负责 localStorage 确认状态、独立隐私页放行与可滚动全屏阻塞弹层，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
system/: 设计系统壳层、品牌 mark 与 surface 基元目录，统一 sidebar、top bar、panel 与 section 结构语义，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
timeline/: 时间线表格组件目录，收敛 TimelineTable、基本信息区块、初发区块与治疗线区块渲染，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
theme-toggle.tsx: 全局主题切换入口，供壳层头部复用且只负责 theme 状态，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
locale-toggle.tsx: 全局语言切换入口，与 ThemeToggle 并列复用但只负责 locale 状态，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
ui/: shadcn/ui 基础组件与轻量封装
workspace/: 临床工作区 feature 组件目录，统一输入区、追问补充区与报告预览骨架，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 组件只表达结构与交互骨架，不承载数据持久化决策。
