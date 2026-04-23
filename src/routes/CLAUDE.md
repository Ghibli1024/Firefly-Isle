# src/routes/
> L2 | 父级: /src/CLAUDE.md

成员清单
CLAUDE.md: 说明四类页面骨架文件与路由职责，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
login-page.tsx: 登录页容器，对应 /login，负责认证状态、主题选择与展示层接线，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
privacy-page.tsx: 独立隐私条款页，对应 /privacy，复用共享隐私真相源并为部署后产品入口提供可访问政策说明，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
workspace-page.tsx: 临床工作区实现，对应 /app，在统一 system shell 与 surface token 上承载文本提取、最多 3 轮追问、解析失败重试、最近患者记录恢复、直接进入时间线主表面的报告预览与 inline edit 持久化，并通过 copy 真相源输出单语错误与状态文案，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
workspace-page.test.tsx: 工作区报告区与 locale 回归测试，约束 dark/light 都不再渲染多余总标题壳且关键文案按当前语言单语输出，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
record-page.tsx: 档案详情复刻实现，对应 /record/:id，Dark/Light 通过统一 system shell 与 surface token 对齐 docs/design 的档案稿，并通过 copy 真相源切换单语文案后复用认证出口，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 路由页负责组合页面块，不承载跨页面状态机，也不重复给 feature 区块加装饰性总壳。
