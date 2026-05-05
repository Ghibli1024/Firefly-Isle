## ADDED Requirements

### Requirement: 自然语言编辑复用字段编辑边界
系统 SHALL 允许自然语言修改指令复用现有 PatientFieldTarget 字段编辑边界，并与逐格编辑保持一致的保存语义。

#### Scenario: 自然语言修改进入同一字段边界
- **WHEN** 用户用自然语言修改已有 PatientRecord 字段
- **THEN** 系统 SHALL 将修改归一为 PatientFieldTarget 支持的字段目标
- **AND** 系统 SHALL 使用与逐格编辑相同的字段归一化和持久化逻辑保存修改

#### Scenario: 自然语言清空字段
- **WHEN** 用户明确要求删除或清空某个支持的字段
- **THEN** 系统 SHALL 将对应字段设为 undefined，而非保存空字符串
