## ADDED Requirements

### Requirement: 公开 Demo 模式覆盖完整产品主链路
系统 SHALL 提供无需登录即可访问的 Demo 模式，用于投资人演示、使用教程和开发调试，并覆盖当前产品主链路的主要可见能力。

#### Scenario: 打开公开 Demo
- **WHEN** 用户访问 `/demo`
- **THEN** 系统 SHALL 进入公开 Demo 模式
- **AND** 系统 SHALL NOT 要求创建、恢复或伪造 Supabase session
- **AND** 系统 SHALL 展示真实产品页面组件，而不是营销落地页

#### Scenario: Demo 页面显示模式提醒
- **WHEN** 用户访问 `/demo/record` 或 `/demo/analytics`
- **THEN** 页面 SHALL 显示当前为 Demo 视图的提醒
- **AND** 提醒 SHALL 说明数据为公开演示数据
- **AND** 提醒 SHALL 说明 Demo 不会写入个人账号

#### Scenario: Demo 覆盖病历详情能力
- **WHEN** 用户访问 Demo 病历页
- **THEN** 页面 SHALL 展示档案视图、极简 TimelineTable 视图、Gantt 视图、实验室趋势、AI 分析预览、分享预览和 PDF/PNG 导出入口
- **AND** 页面 SHALL 明确表达这些是 Demo/预览能力

#### Scenario: Demo 覆盖指标统计能力
- **WHEN** 用户访问 Demo 统计页
- **THEN** 页面 SHALL 展示血常规、血生化和肿瘤标志物趋势
- **AND** Demo 统计页 SHALL 与 Demo 病历页使用同一语义患者记录和同一组 `labResults`

#### Scenario: Demo 读取公开 Supabase 演示病历
- **WHEN** 系统配置了 `VITE_DEMO_RECORD_SHARE_CODE`
- **THEN** Demo 病历页和 Demo 统计页 SHALL 通过既有只读分享授权码边界读取 Supabase 中的公开演示病历
- **AND** 该读取 SHALL NOT 暴露原始 owner user id
- **AND** 该读取 SHALL NOT 绕过 `record_shares` / RLS 约束

#### Scenario: Demo 公开病历不可用时降级
- **WHEN** `VITE_DEMO_RECORD_SHARE_CODE` 缺失、错误、过期、撤销、不可用、读取失败或读回记录缺少完整治疗线 / `labResults`
- **THEN** Demo SHALL 回退到本地完整 fixture 数据
- **AND** Demo 页面 SHALL 保持可展示、可调试、可教程化

### Requirement: Demo 不污染真实用户数据
系统 SHALL 将 Demo 数据保持为本地 fixture 或只读预览，不得默认写入真实用户或匿名用户的 Supabase 数据空间。

#### Scenario: 真实用户首次进入工作区
- **WHEN** 已认证或匿名用户访问 `/app` 且没有用户自有病历
- **THEN** 工作区 SHALL 保持空白输入/预览状态
- **AND** 系统 SHALL NOT 自动创建 demo patient、demo treatment_lines、demo lab_results 或 demo record_shares

#### Scenario: Demo 编辑不落库
- **WHEN** 用户在 Demo 病历页开启编辑并修改字段
- **THEN** 修改 MAY 在当前页面内临时呈现
- **AND** 系统 SHALL NOT 调用真实 patient 持久化写入

#### Scenario: Demo 分享不创建授权码
- **WHEN** 用户查看 Demo 分享能力
- **THEN** 页面 SHALL 显示分享功能预览或禁用态
- **AND** 系统 SHALL NOT 创建真实 `record_shares` 行
- **AND** 系统 SHALL NOT 暴露真实授权码

### Requirement: Demo AI 分析为静态非诊断预览
系统 SHALL 在 Demo 模式展示 AI 辅助分析能力，但不得调用真实 LLM 或把 Demo 内容保存为真实分析结论。

#### Scenario: Demo 展示 AI 分析预览
- **WHEN** 用户访问 Demo 病历页
- **THEN** 页面 SHALL 展示包含治疗线摘要、指标趋势摘要、复核关注点、就诊前问题和免责声明的静态 AI 分析预览
- **AND** 文案 SHALL 保持非诊断语气

#### Scenario: Demo 不调用 LLM
- **WHEN** 用户在公开 Demo 中查看 AI 分析区域
- **THEN** 浏览器 SHALL NOT 调用 `llm-proxy`
- **AND** 浏览器 SHALL NOT 携带任何 LLM provider API key

### Requirement: Demo 导航保持模式内闭环
系统 SHALL 在 Demo 模式中使用 Demo 路由闭环导航，避免把公开 Demo 用户带入受保护真实记录路由。

#### Scenario: Demo 病历页侧栏
- **WHEN** 用户位于 Demo 病历页
- **THEN** 侧栏病历入口 SHALL 指向 Demo 病历页
- **AND** 侧栏统计入口 SHALL 指向 Demo 统计页

#### Scenario: Demo 统计页侧栏
- **WHEN** 用户位于 Demo 统计页
- **THEN** 侧栏病历入口 SHALL 指向 Demo 病历页
- **AND** 侧栏统计入口 SHALL 指向 Demo 统计页
