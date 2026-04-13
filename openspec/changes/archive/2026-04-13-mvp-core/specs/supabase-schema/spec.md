## ADDED Requirements

### Requirement: patients 表结构
系统 SHALL 在 Supabase PostgreSQL 中创建 patients 表，存储 PatientRecord 的顶层信息与 basicInfo、initialOnset 字段。

#### Scenario: patients 表字段定义
- **WHEN** 创建 patients 表
- **THEN** 表 SHALL 包含以下列：id（uuid, primary key, default gen_random_uuid()）、user_id（uuid, references auth.users）、basic_info（jsonb）、initial_onset（jsonb, nullable）、created_at（timestamptz, default now()）、updated_at（timestamptz, default now()）

### Requirement: treatment_lines 表结构
系统 SHALL 创建 treatment_lines 表，存储各治疗线数据，通过 patient_id 外键关联 patients 表。

#### Scenario: treatment_lines 表字段定义
- **WHEN** 创建 treatment_lines 表
- **THEN** 表 SHALL 包含：id（uuid, primary key）、patient_id（uuid, references patients(id) ON DELETE CASCADE）、line_number（integer, not null）、start_date（text, nullable）、end_date（text, nullable）、regimen（text, not null）、biopsy（text, nullable）、immunohistochemistry（text, nullable）、genetic_test（text, nullable）

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
