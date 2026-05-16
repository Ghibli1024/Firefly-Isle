## ADDED Requirements

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

## MODIFIED Requirements

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
