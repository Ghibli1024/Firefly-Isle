# src/routes/
> L2 | 父级: /src/CLAUDE.md

成员清单
CLAUDE.md: 说明四类页面骨架文件与路由职责，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
login-page.tsx: 登录页容器，对应 /login，负责认证状态、主题选择与 V3 双面板展示层接线，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
privacy-page.tsx: 独立隐私条款页，对应 /privacy，消费 V3 topbar 与 surface token，复用共享隐私真相源并提供可访问政策说明，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
brand-lockup-preview-page.tsx: 品牌锁定组合预览页，对应 /brand-lockup-preview，组合 6 套侧栏品牌区候选并展示 full-label、icon-only、dark、light 四态供选择，不替换生产侧栏，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
brand-lockup-preview-page.test.tsx: 品牌锁定组合预览页回归测试，约束 6 套候选与 light/dark、full-label/icon-only 四态标识同时存在，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
workspace-page.tsx: 临床工作区实现，对应 /app，在统一 system shell 与 surface token 上承载文本提取、最多 3 轮追问、解析失败重试、最近患者记录恢复、直接进入时间线主表面的报告预览与 inline edit 持久化，不承载正式 PDF/PNG 导出入口，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
workspace-page.test.tsx: 工作区报告区、单主按钮、输入 composer 工具行、移除侧栏状态卡、active 导航、病历/语言切换图标、隐藏恢复胶囊、左缘渐进拉出、拖拽到隐藏、紧凑默认弹出宽度与 locale 回归测试，约束 dark/light 都不再渲染正式导出按钮、多余总标题壳、废弃控制块、装饰性运行状态卡、active 卡片高亮、边缘亮条、folder 病历图标、泛化语言图标、下拉误导箭头、过宽隐藏恢复按钮、旧侧栏宽度缓存污染或双语漂移，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
record-page.tsx: 档案详情复刻实现，对应 /record/:id，单文件承载宽幅响应式档案版心、顶部概要、正式 PDF/PNG 导出入口、demo fallback 禁用态、8 项指标、纵向 01/02/03 时间轴、右侧证据卡与底部审计带，复用可变侧栏与认证出口，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
record-page.test.tsx: 病例详情页响应式版心与导出职责回归测试，约束 /record/:id 使用共享宽幅 shell 合同、真实记录 PDF/PNG 可导出、demo fallback 禁用态并禁止回退到 980px 固定画布，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 路由页负责组合页面块，不承载跨页面状态机，也不重复给 feature 区块加装饰性总壳。
