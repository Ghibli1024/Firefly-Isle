## Purpose

定义 Supabase PostgreSQL 表结构、RLS 策略、部署区域与更新时间戳基础设施规则。
## Requirements
### Requirement: patients 表结构
系统 SHALL 在 Supabase PostgreSQL 中创建 patients 表，存储 PatientRecord 的顶层信息与 basicInfo、clinicalNotes、initialOnset 字段。

#### Scenario: patients 表字段定义
- **WHEN** 创建 patients 表
- **THEN** 表 SHALL 包含以下列：id（uuid, primary key, default gen_random_uuid()）、user_id（uuid, references auth.users）、basic_info（jsonb）、clinical_notes（text, nullable）、initial_onset（jsonb, nullable）、created_at（timestamptz, default now()）、updated_at（timestamptz, default now()）

### Requirement: treatment_lines 表结构
系统 SHALL 创建 treatment_lines 表，存储各治疗线数据，通过 patient_id 外键关联 patients 表。

#### Scenario: treatment_lines 表字段定义
- **WHEN** 创建 treatment_lines 表
- **THEN** 表 SHALL 包含：id（uuid, primary key）、patient_id（uuid, references patients(id) ON DELETE CASCADE）、line_number（integer, not null）、start_date（text, nullable）、end_date（text, nullable）、regimen（text, nullable）、biopsy（text, nullable）、immunohistochemistry（text, nullable）、genetic_test（text, nullable）

#### Scenario: regimen 作为业务关键字段而非当前数据库硬约束
- **WHEN** 系统处于信息提取中间态、追问补全前或用户尚未完成编辑
- **THEN** 数据库层 MAY 暂存缺失 regimen 的治疗线记录；应用层 SHALL 继续将 regimen 视为临床关键字段，通过追问、高亮与编辑流程推动补全

#### Scenario: 级联删除
- **WHEN** patients 表中某条记录被删除
- **THEN** 对应的所有 treatment_lines 记录 SHALL 自动级联删除

### Requirement: RLS 行级安全策略
系统 SHALL 对 patients 和 treatment_lines 表启用 RLS，确保每行数据只有所有者（user_id 对应用户）可读写。

#### Scenario: patients 表 RLS
- **WHEN** 用户查询 patients 表
- **THEN** 系统 SHALL 仅返回 user_id = auth.uid() 的记录，其他用户的记录不可见

#### Scenario: treatment_lines 表 RLS
- **WHEN** 用户查询 treatment_lines 表
- **THEN** 系统 SHALL 仅返回通过 patient_id JOIN patients 后 patients.user_id = auth.uid() 的记录

#### Scenario: 未认证用户访问拒绝
- **WHEN** 未携带有效 JWT 的请求访问 patients 或 treatment_lines 表
- **THEN** 数据库 SHALL 返回空结果集或权限拒绝错误，不暴露任何数据

### Requirement: 部署区域
系统 SHALL 优先使用可用的 APAC 区域部署 Supabase 项目，以降低中国大陆目标用户访问延迟。

#### Scenario: 项目节点配置
- **WHEN** 创建 Supabase 项目
- **THEN** 项目区域 SHALL 从可用的 APAC regions 中选择，并以中国大陆目标用户的实际网络测试结果确定最终 region；项目配置文件中 SHALL 记录该节点标识

### Requirement: updated_at 自动更新
系统 SHALL 通过数据库触发器在每次 UPDATE 时自动更新 patients.updated_at 字段。

#### Scenario: 触发器自动更新时间戳
- **WHEN** patients 表任意行被 UPDATE
- **THEN** updated_at 列 SHALL 自动设置为当前 UTC 时间，无需应用层手动传入

### Requirement: lab_results 表结构
系统 SHALL 创建 lab_results 表，存储多次实验室指标读数，并通过 patient_id 外键关联 patients 表；当读数来自网页端报告确认时，系统 SHALL 能通过 batch_id 关联到一次 lab_report_batches 批次。

#### Scenario: lab_results 表字段定义
- **WHEN** 创建 lab_results 表
- **THEN** 表 SHALL 包含：id（uuid, primary key）、patient_id（uuid, references patients(id) ON DELETE CASCADE）、batch_id（uuid, nullable, references lab_report_batches(id) ON DELETE SET NULL）、test_date（text, nullable）、category（text, not null）、item_code（text, not null）、item_name（text, not null）、value（numeric, not null）、unit（text, nullable）、reference_low（numeric, nullable）、reference_high（numeric, nullable）、source（text, not null）、is_derived（boolean, not null, default false）、derivation_method（text, nullable）、created_at（timestamptz）

#### Scenario: 级联删除实验室指标
- **WHEN** patients 表中某条记录被删除
- **THEN** 对应的所有 lab_results 记录 SHALL 自动级联删除

#### Scenario: 删除批次保留可审计读数边界
- **WHEN** 一条 lab_report_batches 记录被删除但患者记录仍保留
- **THEN** 关联的 lab_results.batch_id SHALL 置空或由应用层显式删除对应读数
- **AND** 系统 SHALL NOT 将读数重新关联到错误批次

### Requirement: lab_results RLS 行级安全策略
系统 SHALL 对 lab_results 表启用 RLS，确保实验室指标记录只有所属患者记录的所有者可读写。

#### Scenario: lab_results 表 RLS
- **WHEN** 用户查询 lab_results 表
- **THEN** 系统 SHALL 仅返回通过 patient_id JOIN patients 后 patients.user_id = auth.uid() 的记录

#### Scenario: lab_results 越权写入拒绝
- **WHEN** 用户尝试插入、更新或删除不属于自己的 patient_id 下的 lab_results 记录
- **THEN** 数据库 SHALL 拒绝该操作或返回权限错误

#### Scenario: 未认证用户访问 lab_results 拒绝
- **WHEN** 未携带有效 JWT 的请求访问 lab_results 表
- **THEN** 数据库 SHALL 返回空结果集或权限拒绝错误，不暴露任何实验室指标数据

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
- **AND** model SHALL 为非空值，由用户设置保存

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

### Requirement: lab_report_batches 表结构
系统 SHALL 创建 `lab_report_batches` 表，存储一次网页端实验室报告上传、OCR、确认与保存的批次事实。

#### Scenario: lab_report_batches 表字段定义
- **WHEN** 创建 `lab_report_batches` 表
- **THEN** 表 SHALL 包含：id（uuid, primary key）、patient_id（uuid, references patients(id) ON DELETE CASCADE）、category（text, not null）、test_date（text, nullable）、source_file_name（text, nullable）、source_mime_type（text, nullable）、source_storage_path（text, nullable）、ocr_text（text, nullable）、review_status（text, not null）、created_at（timestamptz）、updated_at（timestamptz）

#### Scenario: 级联删除实验室报告批次
- **WHEN** patients 表中某条记录被删除
- **THEN** 对应的所有 lab_report_batches 记录 SHALL 自动级联删除

### Requirement: lab_report_batches RLS 行级安全策略
系统 SHALL 对 `lab_report_batches` 表启用 RLS，确保实验室报告批次只有所属患者记录的所有者可读写。

#### Scenario: lab_report_batches 表 RLS
- **WHEN** 用户查询 `lab_report_batches` 表
- **THEN** 系统 SHALL 仅返回通过 patient_id JOIN patients 后 patients.user_id = auth.uid() 的记录

#### Scenario: lab_report_batches 越权写入拒绝
- **WHEN** 用户尝试插入、更新或删除不属于自己的 patient_id 下的 `lab_report_batches` 记录
- **THEN** 数据库 SHALL 拒绝该操作或返回权限错误

### Requirement: record_shares 表结构
系统 SHALL 创建 `record_shares` 表，用于保存单份病历的只读分享授权事实。

#### Scenario: record_shares 字段定义
- **WHEN** 创建 `record_shares` 表
- **THEN** 表 SHALL 包含：id（uuid, primary key）、patient_id（uuid, references patients(id) ON DELETE CASCADE）、owner_user_id（uuid, references auth.users）、code_hash（text, unique, not null）、expires_at（timestamptz, not null）、revoked_at（timestamptz, nullable）、created_at（timestamptz）

### Requirement: record_shares 所有者管理隔离
系统 SHALL 只允许记录所有者管理自己的分享。

#### Scenario: 所有者查询分享
- **WHEN** 用户查询 `record_shares`
- **THEN** 系统 SHALL 只返回 `owner_user_id = auth.uid()` 的分享记录

#### Scenario: 非所有者不能创建分享
- **WHEN** 用户尝试为不属于自己的 patient_id 创建分享
- **THEN** 数据库 SHALL 拒绝该操作或应用层 SHALL 在写入前拒绝

#### Scenario: 未认证用户不能管理分享
- **WHEN** 未认证请求尝试创建、撤销或列出分享
- **THEN** 系统 SHALL 拒绝该操作
