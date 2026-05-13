## ADDED Requirements

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
