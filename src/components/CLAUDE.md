# src/components/
> L2 | 父级: /src/CLAUDE.md

成员清单
CLAUDE.md: 说明页面骨架组件与共享交互组件职责，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
app-shell.tsx: Dark/Light 共享壳层入口，组合设计系统 shell、导航、主题切换、认证出口与占位素材输出，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
login-page-view.tsx: 登录页纯展示层，承载无工作区导航的 Dark/Light 入口画布、表单展示、页面级主题切换与隐私条款入口，不直接触碰 Supabase 认证状态，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
login-page-view.test.tsx: 登录页主题壳层回归测试，约束 dark 不混入工作区侧栏、light 使用纯色背景、主题切换脱离认证卡片 header，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
privacy-gate.tsx: 首次使用隐私门控层，负责 localStorage 确认状态、独立隐私页放行与全屏阻塞弹层，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
record/: 档案详情 feature 组件目录，统一总览头部、章节骨架与侧栏信息卡，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
system/: 设计系统壳层与 surface 基元目录，统一 sidebar、top bar、panel 与 section 结构语义
timeline/: 时间线表格组件目录，收敛 TimelineTable、基本信息区块、初发区块与治疗线区块渲染，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
theme-toggle.tsx: 全局主题切换入口，供壳层头部复用，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
ui/: shadcn/ui 基础组件与轻量封装
workspace/: 临床工作区 feature 组件目录，统一输入区、追问补充区与报告预览骨架，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 组件只表达结构与交互骨架，不承载数据持久化决策。
