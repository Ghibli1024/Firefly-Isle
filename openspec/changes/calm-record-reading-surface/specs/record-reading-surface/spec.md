## ADDED Requirements

### Requirement: 病历页面必须以文档阅读层级为主
系统 SHALL 在 Demo 与真实病历页面中以患者信息、临床证据、实验室趋势、治疗时间线和备注作为第一阅读层级，并使用留白、标题和细分隔线代替多层等权重卡片。

#### Scenario: 渲染档案视图
- **WHEN** 用户打开 `/demo/record` 或 `/record/:id` 的档案视图
- **THEN** 病历主体 SHALL NOT 使用带圆角、外边框和阴影的整页大卡片
- **AND** 基本信息 SHALL 以定义列表式网格呈现而不是 KPI 卡片
- **AND** 页面 SHALL 保留原有患者字段、实验室趋势、时间线、备注和字段编辑目标

### Requirement: 装饰性系统与 AI 认证不得出现在病历阅读流
系统 SHALL 只展示由真实状态或能力支持的信息，不得使用装饰性就绪、完整性或 AI 认证文案制造可信感。

#### Scenario: 查看共享顶栏与病历页尾
- **WHEN** 系统渲染病历页共享顶栏和档案内容
- **THEN** 页面 SHALL NOT 显示 `系统状态：就绪`、`System Ready`、`AI VERIFIED`、`数据完整性`、`Data Completeness` 或 `LAST_UPDATE`
- **AND** 页面 SHALL NOT 显示无真实数据绑定的固定更新时间或无功能编辑按钮
- **AND** 真实的 AI 辅助分析及其非诊断免责声明 SHALL 保留

### Requirement: 病历视图与编辑操作必须低干扰且可访问
系统 SHALL 使用文字标签、活动下划线和明确焦点表达档案、表格、甘特图与编辑状态，而不是额外的浮动控制台卡片。

#### Scenario: 切换病历视图
- **WHEN** 用户通过鼠标或键盘切换档案、极简表格或甘特图
- **THEN** 控件 SHALL 保留可访问名称、当前选择状态和原有切换回调
- **AND** 活动视图 SHALL 通过文字强调和底部指示线表达
- **AND** 切换控件 SHALL NOT 依赖外围圆角卡片或填满的活动按钮

#### Scenario: 开启或关闭编辑
- **WHEN** 用户切换病历编辑状态
- **THEN** 页面 SHALL 保留编辑开关、保存中、已保存和错误反馈
- **AND** 编辑动作 SHALL 以次级文字控制呈现，不与导出主操作争夺视觉权重

### Requirement: Demo 提示必须明确但不压过病历内容
系统 SHALL 在公开 Demo 路由保留当前模式、公开数据和不写入个人账号的说明，并将其呈现为低强度的页面说明。

#### Scenario: 打开 Demo 病历或统计页
- **WHEN** 用户访问 `/demo/record` 或 `/demo/analytics`
- **THEN** 页面 SHALL 继续显示 Demo 模式标题、说明与登录入口
- **AND** 提示 SHALL 使用分隔线、短标签和文字链接表达
- **AND** 提示 SHALL NOT 使用大面积强调背景、装饰性预览图标或登录图标

### Requirement: 分享能力必须作为次级 disclosure 保留
系统 SHALL 保留授权码分享的完整能力，并允许读者在需要时展开管理内容。

#### Scenario: Demo 病历显示分享预览
- **WHEN** 用户打开 `/demo/record`
- **THEN** 分享区 SHALL 默认折叠
- **AND** 展开后 SHALL 显示 Demo 不创建真实授权码的说明与原有禁用状态
- **AND** Demo SHALL NOT 写入 `record_shares`

#### Scenario: 真实病历显示分享管理
- **WHEN** 所有者打开 `/record/:id`
- **THEN** 分享区 SHALL 默认展开
- **AND** 创建、复制、查看、过期状态、撤销、加载与错误行为 SHALL 保持可用
- **AND** 分享记录 SHALL 使用行式信息层级而不是每条独立卡片

### Requirement: 临床与实验室信息必须减少容器嵌套但保留语义
系统 SHALL 用章节、列表、表格和分隔线承载 AI 辅助分析与实验室趋势，不得删除真实临床语义或异常状态。

#### Scenario: 查看 AI 辅助分析
- **WHEN** 页面显示 Demo 静态分析或真实分析结果
- **THEN** 治疗摘要、指标趋势、复核关注点和就诊前问题 SHALL 保留
- **AND** 分析区 SHALL 保留非诊断免责声明和真实/Demo 能力边界
- **AND** 子分区 SHALL NOT 每个都渲染为独立圆角卡片

#### Scenario: 查看实验室趋势
- **WHEN** PatientRecord 包含实验室读数
- **THEN** 趋势表、状态、参考范围、日期和警示 SHALL 保留
- **AND** 面板 SHALL 使用平面章节与必要的表格分隔线，而不是外围大卡片
