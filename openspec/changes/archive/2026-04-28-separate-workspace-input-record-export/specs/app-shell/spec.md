## MODIFIED Requirements

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
