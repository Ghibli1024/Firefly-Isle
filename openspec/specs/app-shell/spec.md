## Purpose

定义 Firefly-Isle MVP 的页面壳层、三类核心页面、主题切换空间角色与登录页入口边界。
## Requirements
### Requirement: MVP 仅包含三类 Web 页面结构
系统 SHALL 在 MVP 中围绕登录页面、临床工作区、档案详情与独立隐私页组织界面结构，并要求这些页面在 dark / light 主题间共享同一套视觉系统、组件角色与主题语义；登录页面 SHALL 在同一路由内使用项目介绍页与 CTA 驱动统一登录弹层的组合入口。

#### Scenario: 登录页保持单一路由
- **WHEN** 系统实现项目介绍页与统一登录弹层
- **THEN** 系统 SHALL 继续使用既有 `/login` 路由
- **AND** 系统 SHALL NOT 为登录弹层或项目介绍新增单独路由

#### Scenario: 登录页结构包含介绍页与按需登录弹层
- **WHEN** 用户访问 `/login`
- **THEN** 页面 SHALL 提供全屏双主题海岸介绍区域用于展示产品定位、能力路径与安全状态
- **AND** 页面 SHALL 在用户触发 `登录` 后提供统一登录弹层用于承载登录、注册、匿名会话与隐私说明
- **AND** 页面 SHALL 在项目介绍区域提供主题切换与语言切换工具
- **AND** 登录弹层 SHALL 与项目介绍区域处于同一页面结构，而不是独立跳转页面

#### Scenario: 登录弹层由 CTA 展开或收起
- **WHEN** 用户首次访问 `/login`
- **THEN** 页面 SHALL 默认只展示项目介绍区域与 `登录` CTA
- **AND** 页面 SHALL NOT 默认展示登录表单或右侧窄身份访问抽屉
- **WHEN** 用户触发项目介绍区域中的 `登录` CTA
- **THEN** 页面 SHALL 挂载并展示统一登录弹层
- **AND** 桌面端 SHALL 使用与窄屏一致的居中弹层，而不是右侧抽屉或横向让位布局
- **AND** 该状态变化 SHALL NOT 改变认证业务语义或已输入表单值

#### Scenario: 窄屏按需弹出登录卡
- **WHEN** 窄屏用户访问 `/login`
- **THEN** 页面 SHALL 优先展示项目介绍区域
- **AND** 与桌面统一弹层同源的登录卡 SHALL 默认隐藏
- **WHEN** 用户触发项目介绍区域中的 `登录` CTA
- **THEN** 页面 SHALL 以弹层呈现同源登录卡
- **AND** 登录卡 SHALL 保留邮箱登录、注册模式、匿名会话与隐私说明入口
- **AND** 用户 SHALL 能关闭弹层回到项目介绍区域

### Requirement: 页面结构必须复刻设计稿
系统 SHALL 以输入提取台和正式档案导出台的职责分离为 `/app` 与 `/record/:id` 的页面结构依据，并保持 dark / light 主题只改变 token、材质与品牌 mark，不改变页面职责。

#### Scenario: 临床工作区复刻输入提取台结构
- **WHEN** 系统实现 `/app` 的 Dark 或 Light 页面
- **THEN** 页面 SHALL 将病史输入与结构化提取作为主职责
- **AND** 页面 SHALL 在输入区之后进入提取参数、结构化病历预览、缺失字段提示与草稿状态
- **AND** 页面 SHALL NOT 将 PDF/PNG 正式导出动作作为 `/app` 输入区动作

#### Scenario: 档案详情复刻正式导出台结构
- **WHEN** 系统实现 `/record/:id` 的 Dark 或 Light 页面
- **THEN** 页面 SHALL 将正式病历档案、长卷治疗线阅读与 PDF/PNG 导出作为主职责
- **AND** 页面 SHALL 保留患者概要、治疗线、右侧临床证据卡与底部审计/验证区

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
- **AND** 匿名会话 SHALL 使用 `theater_comedy` 图标，非匿名认证会话 SHALL 使用 `person` 图标
- **AND** 主题切换 SHALL NOT 改变侧栏响应语法

#### Scenario: 顶部区域承担同一空间职责
- **WHEN** 壳层渲染 Dark 或 Light 的顶部区域
- **THEN** 顶部区域 SHALL 承担页面名、系统状态、帮助入口与设置敬请期待占位的同一空间角色
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
- **THEN** route SHALL 保留提取、持久化与 follow-up 状态机，并将输入区、追问区与报告预览区委派给独立 feature components

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
系统 SHALL 在 `/app` 中只渲染一个主要结构化提取动作，并将文件导入、语音输入与字数统计作为同一个病史输入 buffer 的输入工具，不得在 `/app` 中暴露正式 PDF/PNG 导出入口。

#### Scenario: 单一主提取动作
- **WHEN** 系统渲染 `/app` 的 Dark 或 Light 主题
- **THEN** 页面 SHALL 在病史输入区附近渲染且仅渲染一个主要“开始结构化提取”动作
- **AND** 页面 SHALL NOT 在输入面板外再渲染第二个主提取动作

#### Scenario: 输入工具与字数统计归属 textarea
- **WHEN** 系统渲染 `/app` 的病史输入 textarea
- **THEN** textarea 底部左侧 SHALL 提供“导入病历文件”输入工具
- **AND** textarea 底部右侧 SHALL 提供语音输入入口与 `0 / 8000` 字数统计
- **AND** 语音入口 SHALL NOT 以独立“语音录入卡片”进入主流程行动块

#### Scenario: 正式导出不属于工作区输入台
- **WHEN** 系统渲染 `/app` 的输入行动区
- **THEN** 页面 SHALL NOT 渲染“导出 PDF”或“导出 PNG”按钮
- **AND** 提取完成后的下一步动作 MAY 引导用户保存并打开 `/record/:id`

#### Scenario: 已废弃控制块不进入主流程
- **WHEN** 系统渲染 `/app` 的主工作流
- **THEN** 页面 SHALL NOT 在主输入后继续显示已废弃的独立语音录入卡片
- **AND** 病史输入后 SHALL 直接进入治疗时间线草稿、缺失字段提示与状态信息

### Requirement: 视觉重构不得改变业务边界
系统 SHALL 将本次变更限制在视觉系统、theme token、shared shell、页面 composition、组件 styling 与文档同步，不得改变当前业务流程与数据边界。

#### Scenario: 登录入口不改变 Auth 行为
- **WHEN** 用户在登录入口内登录、注册、匿名进入、切换主题或切换语言
- **THEN** 系统 SHALL 保持现有 Supabase Auth、匿名 session、主题偏好、语言偏好与错误反馈行为不变
- **AND** 弹层展开或收起 SHALL NOT 触发认证请求

### Requirement: 壳层暴露全局音乐控制
系统 SHALL 在登录入口与已登录应用壳层中暴露同一个全局音乐控制能力，并保持现有路由职责、布局几何与业务边界不变。

#### Scenario: 登录入口提供音乐控制
- **WHEN** 用户访问 `/login`
- **THEN** 登录介绍区域 SHALL 提供音乐控制
- **AND** 音乐控制 SHALL 与现有主题切换、语言切换工具共享同一入口工具语法
- **AND** 音乐控制 SHALL NOT 打开登录弹层、触发认证请求或改变已输入表单值

#### Scenario: 已登录页面提供音乐控制
- **WHEN** 用户访问 `/app` 或 `/record/:id`
- **THEN** 应用壳层 SHALL 提供音乐控制
- **AND** 音乐控制 SHALL 复用共享 shell action 语义，而不是在每个 route 文件中重复实现
- **AND** 音乐控制 SHALL NOT 改变侧栏宽度、顶部区域职责、主内容起始线或主要操作位置

#### Scenario: 主题和语言切换不重置音乐状态
- **WHEN** 用户切换 dark/light 主题或 zh/en 语言
- **THEN** 音乐控制 SHALL 保持当前音乐状态
- **AND** 音乐控制 SHALL 使用当前主题 token 与当前语言标签重新渲染

### Requirement: 音乐控制暴露简洁歌单操作
系统 SHALL 在现有全局音乐控制中暴露当前曲目文本与上一首/下一首操作，并保持登录入口和已登录壳层的空间职责不变。

#### Scenario: 登录入口展示当前曲目
- **WHEN** 用户访问 `/login`
- **THEN** 登录介绍区域的音乐控制 SHALL 展示当前曲目标题
- **AND** 音乐控制 SHALL 提供上一首和下一首操作
- **AND** 音乐控制 SHALL NOT 打开登录弹层、触发认证请求或改变已输入表单值

#### Scenario: 已登录壳层展示紧凑歌单控制
- **WHEN** 用户访问 `/app` 或 `/record/:id`
- **THEN** 应用壳层 SHALL 在共享 shell action 区域展示音乐开关、当前曲目文本、上一首和下一首操作
- **AND** 该控制 SHALL 复用共享音乐组件，而不是在 route 文件中重复实现
- **AND** 该控制 SHALL NOT 改变侧栏宽度、主内容起始线或核心业务操作位置

#### Scenario: 歌单控制具备可访问语义
- **WHEN** 系统渲染上一首或下一首控制
- **THEN** 控制 SHALL 暴露可访问标签
- **AND** 控制 SHALL 支持键盘触发
- **AND** 当前曲目标题 SHALL 作为可读文本呈现
