## Purpose

定义自然语言病史到 PatientRecord 的结构化提取、缺失字段追问与 LLM 输出约束。
## Requirements
### Requirement: 自然语言输入转换为 PatientRecord
系统 SHALL 接受用户自然语言描述，调用 LLM 提取结构化 PatientRecord JSON，用于后续追问、渲染与保存。

#### Scenario: 单次输入完整提取
- **WHEN** 用户输入包含足够信息的自然语言描述（如「女，52岁，2022年确诊肺腺癌IV期，一线化疗6周期」）
- **THEN** 系统 SHALL 在一次 LLM 调用后返回完整 PatientRecord JSON，无需追问

#### Scenario: 提取结果类型正确性
- **WHEN** LLM 返回提取结果
- **THEN** age、height、weight、lineNumber 等数值字段 SHALL 为 number 类型，日期字段 SHALL 为 ISO 8601 字符串格式（YYYY-MM-DD 或 YYYY-MM）

### Requirement: 缺失关键字段识别
系统 SHALL 识别 PatientRecord 中对临床意义重要的缺失字段，并生成追问内容。

#### Scenario: 识别缺失关键字段
- **WHEN** 提取结果中 tumorType、stage、regimen 等关键字段缺失
- **THEN** 系统 SHALL 生成针对性追问文本，明确指出需要补充的信息

#### Scenario: 非关键字段缺失不追问
- **WHEN** 提取结果中仅 height、weight 等非核心字段缺失
- **THEN** 系统 SHALL 不因这些字段缺失而发起追问，直接返回当前结果

### Requirement: 最多 3 轮追问机制
系统 SHALL 限制追问轮次不超过 3 轮，第 3 轮追问后无论信息是否完整均终止追问，返回当前最优结果。

#### Scenario: 追问轮次上限
- **WHEN** 已进行 3 轮追问
- **THEN** 系统 SHALL 停止追问，将当前已提取的 PatientRecord 传递给下一步处理，缺失字段保持为 undefined

#### Scenario: 信息充足时提前终止追问
- **WHEN** 第 1 轮或第 2 轮追问后关键字段已补全
- **THEN** 系统 SHALL 提前终止追问流程，不再发起新一轮追问

### Requirement: 追问内容合并
系统 SHALL 将多个缺失字段的追问合并为一次用户交互，不得逐字段单独追问。

#### Scenario: 合并多字段追问
- **WHEN** 存在 3 个及以上缺失字段需要追问
- **THEN** 系统 SHALL 在单条消息中列出所有需要补充的字段，用户一次性回复

### Requirement: LLM Prompt 结构化约束
系统 SHALL 使用紧凑 JSON 字段合同约束 LLM 输出 PatientRecord，不得把完整 TypeScript 接口塞入面向模型的主提示词。

#### Scenario: 非法 JSON 处理
- **WHEN** LLM 返回非法 JSON 或包含 markdown 代码块包裹的 JSON
- **THEN** 系统 SHALL 尝试提取 JSON 内容并解析，解析失败时 SHALL 向用户展示错误提示并允许重试

#### Scenario: Dense clinical history fallback
- **WHEN** 系统内置模型的 JSON object 输出模式因长病史或密集治疗表格返回上游失败
- **THEN** 系统 SHALL 使用同一份紧凑 JSON 字段合同重试一次普通文本模式
- **AND** 若普通文本模式仍返回 502 上游失败或非法响应，系统 SHALL 使用服务端 Gemini provider 兜底重试一次
- **AND** 成功返回的 JSON SHALL 继续进入 PatientRecord 解析、归一化与预览流程

### Requirement: Confirmed OCR text reuses structured extraction
The system SHALL feed confirmed OCR text into the existing natural-language PatientRecord extraction flow.

#### Scenario: Confirmed OCR text creates PatientRecord
- **WHEN** a user confirms recognized OCR text and no current PatientRecord exists
- **THEN** the system SHALL call the existing structured extraction flow
- **AND** the resulting PatientRecord SHALL render through the existing preview and follow-up path

#### Scenario: Confirmed OCR text merges with existing PatientRecord
- **WHEN** a user confirms recognized OCR text while a PatientRecord already exists
- **THEN** the system SHALL reuse the existing merge semantics for extracted PatientRecord updates
- **AND** fields not mentioned in the OCR text SHALL NOT be overwritten
