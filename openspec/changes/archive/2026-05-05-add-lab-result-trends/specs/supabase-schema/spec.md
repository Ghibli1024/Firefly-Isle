## ADDED Requirements

### Requirement: lab_results 表结构
系统 SHALL 创建 lab_results 表，存储多次实验室指标读数，并通过 patient_id 外键关联 patients 表。

#### Scenario: lab_results 表字段定义
- **WHEN** 创建 lab_results 表
- **THEN** 表 SHALL 包含：id（uuid, primary key）、patient_id（uuid, references patients(id) ON DELETE CASCADE）、test_date（text, nullable）、category（text, not null）、item_code（text, not null）、item_name（text, not null）、value（numeric, not null）、unit（text, nullable）、reference_low（numeric, nullable）、reference_high（numeric, nullable）、source（text, not null）、created_at（timestamptz）

#### Scenario: 级联删除实验室指标
- **WHEN** patients 表中某条记录被删除
- **THEN** 对应的所有 lab_results 记录 SHALL 自动级联删除

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
