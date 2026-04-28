# src/components/
> L2 | 父级: /src/CLAUDE.md

成员清单
CLAUDE.md: 说明页面骨架组件与共享交互组件职责，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
app-shell.tsx: Dark/Light 共享壳层入口，导出 V3 顶部状态条、可变侧栏、主题切换、认证出口与占位素材，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
login-page-view.tsx: 登录页纯展示层，负责双主题全屏海岸 intro、A 版左侧品牌入口、主页面工具区、CTA 驱动的统一登录弹层与参考图式灯塔路径登录卡，不直接触碰 Supabase 认证状态，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
login-trace-map.tsx: 登录页全屏背景模块，按主题渲染蓝眼泪夜海或平潭风车白昼海岸背景，只承载干净铺底与线性氛围遮罩，不再承载 waypoint、说明弹窗或圆形径向光晕，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
login-page-view.test.tsx: 登录页主题壳层回归测试，约束入口页不混入工作区侧栏、旧伪技术装饰、点阵背景或旧固定宽画布，并锁住 A 版首屏节奏、双主题扁平背景、无圆形光晕主入口、主页面工具区、默认不挂载统一登录弹层，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
privacy-gate.tsx: 首次使用隐私门控层，负责 localStorage 确认状态、独立隐私页放行与可滚动全屏阻塞弹层，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
system/: 设计系统壳层、品牌 mark 与 surface 基元目录，统一 sidebar、top bar、panel 与 section 结构语义，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
timeline/: 时间线表格组件目录，收敛 TimelineTable、基本信息区块、初发区块与治疗线区块渲染，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
theme-toggle.tsx: 全局主题切换入口，供壳层头部复用且只负责 theme 状态，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
locale-toggle.tsx: 全局语言切换入口，与 ThemeToggle 并列复用但只负责 locale 状态，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
ui/: shadcn/ui 基础组件与轻量封装
workspace/: 临床工作区 feature 组件目录，统一输入区、追问补充区与报告预览骨架，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 组件只表达结构与交互骨架，不承载数据持久化决策。
