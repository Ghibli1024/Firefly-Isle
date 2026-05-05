## ADDED Requirements

### Requirement: llm_provider_settings 表结构
系统 SHALL 创建 `llm_provider_settings` 表，存储每个用户当前启用的自带 LLM provider 设置，并只保存加密后的 API key 材料。

#### Scenario: llm_provider_settings 表字段定义
- **WHEN** 创建 `llm_provider_settings` 表
- **THEN** 表 SHALL 包含：id（uuid, primary key）、user_id（uuid, references auth.users, unique）、provider（text）、base_url（text, nullable）、model（text, nullable）、api_key_ciphertext（text）、api_key_iv（text）、created_at（timestamptz）、updated_at（timestamptz）
- **AND** 表 SHALL NOT 包含 plaintext api key 字段

#### Scenario: preset 与 custom 约束
- **WHEN** provider 为 `custom_openai`
- **THEN** base_url 与 model SHALL 为非空值
- **WHEN** provider 为预设平台
- **THEN** base_url SHALL 为空，由 Edge Function registry 维护

### Requirement: llm_provider_settings RLS 行级安全策略
系统 SHALL 对 `llm_provider_settings` 启用 RLS，确保每个用户只能读写自己的 provider 设置。

#### Scenario: llm_provider_settings 读取隔离
- **WHEN** 用户查询 `llm_provider_settings`
- **THEN** 系统 SHALL 仅返回 `user_id = auth.uid()` 的记录，其他用户的记录不可见

#### Scenario: llm_provider_settings 写入隔离
- **WHEN** 用户插入、更新或删除 provider 设置
- **THEN** 数据库 SHALL 只允许 `user_id = auth.uid()` 的行被写入或删除

#### Scenario: 未认证访问拒绝
- **WHEN** 未携带有效 JWT 的请求访问 `llm_provider_settings`
- **THEN** 数据库 SHALL 返回空结果集或权限拒绝错误，不暴露任何 provider 设置数据
