## ADDED Requirements

### Requirement: 档案页提供非诊断 AI 辅助分析
系统 SHALL 在真实 `/record/:id` 档案页为当前患者记录提供 AI 辅助分析入口。

#### Scenario: 用户触发分析
- **WHEN** 用户在真实 `/record/:id` 档案页触发 AI 分析
- **THEN** 系统 SHALL 基于当前 `PatientRecord` 和可选 `labResults` 构造分析请求
- **AND** 请求 SHALL 通过现有 `chat()` / `llm-proxy` 边界发送
- **AND** 浏览器 SHALL NOT 直接携带任何 LLM provider API key

#### Scenario: demo 记录不伪造真实分析
- **WHEN** 用户访问 `/record/demo`
- **THEN** 系统 MAY 展示 AI 分析能力说明或禁用态
- **AND** 系统 SHALL NOT 把 demo 数据保存为真实分析结论

### Requirement: AI 分析输出使用结构化 schema
系统 SHALL 要求 AI 分析返回结构化 JSON，并在展示前校验结果。

#### Scenario: 返回合法结构化分析
- **WHEN** LLM 返回包含治疗线摘要、指标趋势摘要、关注点、复核问题和免责声明的合法 JSON
- **THEN** 页面 SHALL 分区展示这些内容
- **AND** 页面 SHALL 保持非诊断语气

#### Scenario: 返回非法结构
- **WHEN** LLM 返回非 JSON、空内容或缺少必要字段
- **THEN** 系统 SHALL 显示可读失败态
- **AND** 系统 SHALL NOT 将原始模型输出当作正式分析展示

### Requirement: 无实验室趋势时降级为治疗线摘要
系统 SHALL 在记录缺少 `labResults` 时降级分析，不编造实验室趋势。

#### Scenario: 记录没有 labResults
- **WHEN** 当前记录没有已保存实验室指标读数
- **THEN** 分析 SHALL 只总结病历和治疗线信息
- **AND** 指标趋势区域 SHALL 明确说明暂无已保存实验室指标

### Requirement: AI 分析不得输出诊断或治疗指令
系统 SHALL 将分析限制为整理、沟通和复核参考，不得输出确定诊断、疾病进展结论、用药建议或治疗指令。

#### Scenario: 页面展示分析结果
- **WHEN** AI 分析结果可见
- **THEN** 页面 SHALL 展示免责声明
- **AND** 页面 SHALL NOT 使用“确诊为”、“建议用药”、“应立即更换治疗方案”等治疗指令式表达作为系统固定文案

### Requirement: 分析失败可恢复
系统 SHALL 对 LLM 配置错误、鉴权错误、限流、上游失败和网络失败提供可读反馈。

#### Scenario: LLM 请求失败
- **WHEN** 分析请求失败
- **THEN** 页面 SHALL 显示失败原因的安全摘要和重试入口
- **AND** 页面 SHALL 保留当前档案、甘特图和导出能力可用
