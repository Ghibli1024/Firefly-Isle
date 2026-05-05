# src/components/
> L2 | 父级: /src/CLAUDE.md

成员清单
CLAUDE.md: 说明页面骨架组件与共享交互组件职责，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
app-shell.tsx: Dark/Light 共享壳层入口，导出 V3 顶部状态条、可变侧栏、匿名/非匿名会话身份展示、主题切换、认证出口与占位素材，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
background-music-toggle.tsx: 全局背景音乐共享控件，消费 BackgroundAudioProvider 状态并以可访问标签表达播放、暂停、拦截、不可用、当前曲目、上一首/下一首、离开收回与半透明弹出短侧舱操作，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
background-music-toggle.test.tsx: 背景音乐控制入口回归测试，约束登录页工具区与 authenticated top bar 共用同一音乐开关、曲目标题、切歌语义、暂停文案、离开收回和透明弹出短侧舱材质，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
login/: 登录页展示层内部模块，收敛类型、skin、文案、认证卡、统一弹层、入口布局与背景图，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
login-page-view.tsx: 登录页稳定 facade，继续导出 LoginPageView 与 AuthMode/AuthMethod/AuthFeedback/LoginPageViewProps，内部转交 components/login 实现，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
login-page-view.test.tsx: 登录页主题壳层与认证弹层回归测试，读取 facade 与 components/login 内部源码合同，约束入口页、背景音乐工具、邮箱模式、手机/微信敬请期待占位、Google 与重置密码边界，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
privacy-gate.tsx: 首次使用隐私门控层，负责 localStorage 确认状态、独立隐私页放行与可滚动全屏阻塞弹层，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
record/: 病例详情展示层内部模块，收敛 dossier 展示、文案、demo 数据、真实病历派生数据与展示类型，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
system/: 设计系统壳层、品牌 mark 与 surface 基元目录，统一 sidebar、top bar、panel 与 section 结构语义，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
timeline/: 时间线表格与甘特图组件目录，收敛 TimelineTable、基本信息区块、初发区块、治疗线区块渲染与 treatmentLines 甘特投影，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
theme-toggle.tsx: 全局主题切换入口，供壳层头部复用且只负责 theme 状态，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
locale-toggle.tsx: 全局语言切换入口，与 ThemeToggle 并列复用但只负责 locale 状态，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
ui/: shadcn/ui 基础组件与轻量封装，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
workspace/: 临床工作区 feature 组件目录，统一输入区、追问补充区与报告预览骨架，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 组件只表达结构与交互骨架，不承载数据持久化决策。
