## Purpose

定义 Firefly-Isle MVP 的页面壳层、三类核心页面、主题切换空间角色与登录页入口边界。
## Requirements
### Requirement: MVP 仅包含三类 Web 页面结构
系统 SHALL 在 MVP 中围绕登录页面、临床工作区、档案详情与独立隐私页组织界面结构，并要求这些页面在 dark / light 主题间共享同一套视觉系统、组件角色与主题语义。

#### Scenario: 页面结构范围
- **WHEN** 实现 MVP 前端页面结构
- **THEN** 系统 SHALL 保持既有 `/login`、`/privacy`、`/app`、`/record/:id` 路由不变
- **AND** 系统 SHALL NOT 新增或删除路由来完成本次视觉重构

#### Scenario: dark / light 页面共享空间角色
- **WHEN** 系统在同一 Web 页面上切换 Dark 或 Light 主题
- **THEN** 侧栏、顶部区域、主内容区、版心、报告容器和主要操作位置 SHALL 保持同构空间角色，而不是因主题切换变成不同信息架构

### Requirement: 页面结构必须复刻设计稿
系统 SHALL 以 `docs/design/Image-2/V3/` 中的 `DESIGN.md` 与截图作为页面结构实现的设计证据源，并将这些结构约束折叠为统一的壳层几何合同、组件角色与主题材料语言。

#### Scenario: 登录页复刻 V3 入口结构
- **WHEN** 系统实现 `/login` 的 Dark 或 Light 页面
- **THEN** 页面 SHALL 对齐 V3 品牌入口与身份访问控制台结构
- **AND** 页面 SHALL 保留强烈视觉冲击，不得退化为通用 SaaS 登录页
- **AND** Supabase 邮箱登录、注册与匿名登录行为 SHALL 保持不变

#### Scenario: 临床工作区复刻 V3 页面结构
- **WHEN** 系统实现 `/app` 的 Dark 或 Light 页面
- **THEN** 页面 SHALL 对齐 V3 的响应式左侧导航、顶部状态区、病史输入、行动按钮和治疗时间线主流
- **AND** 页面 SHALL 保持主内容起始线与版心关系在主题切换时一致

#### Scenario: 档案详情复刻 V3 长卷结构
- **WHEN** 系统实现 `/record/:id` 的 Dark 或 Light 页面
- **THEN** 页面 SHALL 对齐 V3 的顶部病历概要、纵向治疗时间线、右侧临床证据卡片与底部审计/验证区
- **AND** 页面 SHALL 保留长卷阅读节奏，不得压缩为一屏通用 dashboard

#### Scenario: 隐私页消费 V3 视觉系统
- **WHEN** 系统实现 `/privacy`
- **THEN** 页面 SHALL 消费 V3 token、surface 与 typography 语义
- **AND** 隐私文案真相源 SHALL 继续来自 `src/lib/privacy.ts`

### Requirement: 主题切换作用于全局页面结构
系统 SHALL 将主题切换能力放置在应用壳层中，并要求主题切换只改变材质和设计系统映射，不改变壳层空间关系。

#### Scenario: 主题切换作用于全局页面结构
- **WHEN** 用户切换主题
- **THEN** 主题变化 SHALL 作用于登录页面、临床工作区和档案详情等全局页面结构，而不是仅作用于局部组件

#### Scenario: 主题切换不改变侧栏宽度与顶部角色
- **WHEN** 用户在 Dark 与 Light 间切换
- **THEN** 侧栏宽度、顶部区域职责、主内容起始线与主要分隔关系 SHALL 保持不变

### Requirement: 壳层几何必须通过统一合同定义
系统 SHALL 为 App Shell 定义 V3 geometry contract，至少覆盖默认展开侧栏、隐藏侧栏、拖拽缩放、compact icon-only 阈值、顶部状态角色、主内容起始线、主区版心宽度、壳层分隔线语义与桌面/移动响应规则。

#### Scenario: 侧栏响应态同构
- **WHEN** 壳层渲染 `/app` 或 `/record/:id` 的 Dark 或 Light 主题侧栏
- **THEN** 侧栏 SHALL 默认展开并显示 logo mark、产品名、图标、标签、状态点、主题/语言工具与会话出口能力
- **AND** 用户 SHALL 能通过侧栏右边界中部的无文字胶囊柄点击切换全量显示、仅图标显示与隐藏显示
- **AND** 侧栏隐藏后，用户 SHALL 能点击左边缘窄浮标恢复侧栏，或从左边缘向右拖拽并随拖拽距离渐进拉出侧栏
- **AND** 用户 SHALL 能通过拖拽同一个胶囊柄连续调整侧栏宽度，并在继续向左越过隐藏浮标宽度后完全隐藏侧栏
- **AND** 当侧栏宽度低于 compact 阈值时，标签文字 SHALL 自动隐藏，仅保留图标和 tooltip
- **AND** 主题切换 SHALL NOT 改变侧栏响应语法

#### Scenario: 顶部区域承担同一空间职责
- **WHEN** 壳层渲染 Dark 或 Light 的顶部区域
- **THEN** 顶部区域 SHALL 承担页面名、系统状态、帮助与设置入口的同一空间角色
- **AND** Light 主题 SHALL NOT 使用与 Dark 主题结构不同的独立 masthead 来改变主内容起始线

#### Scenario: 分隔线语义可解释
- **WHEN** 壳层渲染边框、规则线或强调线
- **THEN** 每条线 SHALL 属于结构边界、区块边界或强调线之一，不得保留没有明确语义的装饰性边线

### Requirement: 壳层必须通过设计系统组件组合
系统 SHALL 让登录页、工作区与档案页通过统一的壳层级系统组件组合页面，而不是在每个页面内重复拼装主题结构。

#### Scenario: 页面复用壳层系统组件
- **WHEN** 登录页、工作区或档案页需要渲染 sidebar、top bar、masthead、panel 或 section header
- **THEN** 页面 SHALL 复用设计系统定义的壳层组件，而不是在页面文件中重新发明结构与视觉语义

### Requirement: Route 文件必须只承担 orchestration 职责
系统 SHALL 让复杂页面 route 文件聚焦于入口、参数、状态机总线与 feature component 编排，而不是继续承载大段展示结构。

#### Scenario: workspace route 聚焦状态与编排
- **WHEN** 系统实现 `/app` 对应的 route 文件
- **THEN** route SHALL 保留提取、导出、持久化与 follow-up 状态机，并将输入区、追问区与报告预览区委派给独立 feature components

#### Scenario: record route 聚焦主题分发与编排
- **WHEN** 系统实现 `/record/:id` 对应的 route 文件
- **THEN** route SHALL 保留 dark / light 顶层分发与路由参数处理，并将总览头部、章节框架与信息卡等展示块委派给独立 feature components

### Requirement: 页面业务结构必须通过 feature 组件承载
系统 SHALL 在 design-system 的 `system` 层与 route 层之间建立 feature 组件中间层，用于承载页面专属业务结构，而不是把这些结构塞回 system 或继续留在 route 内。

#### Scenario: workspace feature 组件承载页面区块
- **WHEN** `/app` 页面需要渲染输入区、追问区或报告预览区
- **THEN** 这些区块 SHALL 由 `workspace` feature 组件承载，并继续消费现有 token 与 system shell

#### Scenario: record feature 组件承载章节结构
- **WHEN** `/record/:id` 页面需要渲染病历总览头部、章节框架或信息卡
- **THEN** 这些区块 SHALL 由 `record` feature 组件承载，而不是在 route 文件中重复拼装章节 scaffold

#### Scenario: feature 组件不侵入 design-system 语法层
- **WHEN** feature 组件组合 panel、section、action surface 或 shell
- **THEN** feature 组件 SHALL 复用 `src/components/system/` 里的设计系统基元，不得重新定义新的壳层语义

### Requirement: 壳层必须通过设计系统组件组合
系统 SHALL 让登录页、工作区与档案页通过统一的壳层级系统组件组合页面，而不是在每个页面内重复拼装主题结构。

#### Scenario: 页面复用壳层系统组件
- **WHEN** 登录页、工作区或档案页需要渲染 sidebar、top bar、masthead、panel 或 section header
- **THEN** 页面 SHALL 复用设计系统定义的壳层组件，而不是在页面文件中重新发明结构与视觉语义

### Requirement: 工作区主操作不得重复
系统 SHALL 在 `/app` 中只渲染一个主要结构化提取动作，并将 PDF/PNG 导出作为次级动作保留在同一输入行动区，不得在同一页面中重复渲染第二个主要提取按钮。

#### Scenario: 单一主提取动作
- **WHEN** 系统渲染 `/app` 的 Dark 或 Light 主题
- **THEN** 页面 SHALL 在病史输入区附近渲染且仅渲染一个主要“开始结构化提取”动作
- **AND** 页面 SHALL NOT 在输入面板外再渲染第二个主提取动作

#### Scenario: 次级导出动作保留
- **WHEN** 系统渲染 `/app` 的输入行动区
- **THEN** 页面 SHALL 保留 PDF 与 PNG 导出动作
- **AND** 导出行为 SHALL 继续调用现有 html2canvas/jsPDF 链路

#### Scenario: V3 已废弃控制块不进入主流程
- **WHEN** 系统渲染 `/app` 的主工作流
- **THEN** 页面 SHALL NOT 在主输入后继续显示“当前提取参数”控制块
- **AND** 页面 SHALL NOT 将语音录入卡片作为主流程行动块
- **AND** 病史输入后 SHALL 直接进入治疗时间线表格与缺失字段提示

### Requirement: 视觉重构不得改变业务边界
系统 SHALL 将本次变更限制在视觉系统、theme token、shared shell、页面 composition、组件 styling 与文档同步，不得改变当前业务流程与数据边界。

#### Scenario: 认证与提取边界保持不变
- **WHEN** 用户登录、注册、匿名进入、提交病史或回答追问
- **THEN** 系统 SHALL 保持现有 Supabase Auth、提取状态机、最多三轮追问、落库与错误恢复行为不变

#### Scenario: 数据与导出边界保持不变
- **WHEN** 系统渲染、编辑、保存或导出 PatientRecord
- **THEN** `PatientRecord` schema、inline edit 保存语义、PDF 导出和 PNG 导出行为 SHALL 保持不变
