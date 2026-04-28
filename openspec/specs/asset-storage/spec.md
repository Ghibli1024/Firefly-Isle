## Purpose

定义患者相关资源的 Supabase Storage 基础设施、访问隔离与 MVP 范围边界。

## Requirements

### Requirement: Storage 基础设施存在
系统 SHALL 在 Supabase 中配置患者相关资源的 Storage 基础设施边界，用于后续可选的附件或图片资源扩展。

#### Scenario: bucket 创建
- **WHEN** 配置 Supabase 项目基础设施
- **THEN** 系统 SHALL 创建用于患者相关资源的 Storage bucket（如 `patient-assets`），作为当前 MVP 的基础设施组成部分

### Requirement: Storage 访问按用户隔离
系统 SHALL 对 Storage 资源应用与认证身份一致的隔离策略，确保不同用户或匿名用户不能访问彼此资源。

#### Scenario: 已认证用户资源隔离
- **WHEN** 已认证用户访问 Storage 中的患者相关资源
- **THEN** 系统 SHALL 仅允许其访问与自身 uid 关联的资源

#### Scenario: 匿名用户资源隔离
- **WHEN** 匿名用户访问 Storage 中的患者相关资源
- **THEN** 系统 SHALL 仅允许其访问与当前匿名 uid 关联的资源，其他匿名用户与注册用户的资源不可见

### Requirement: MVP 不强制暴露上传主流程
系统 SHALL 在当前 MVP 中保留 Storage 基础设施边界，但不强制将图片或附件上传纳入当前主流程。

#### Scenario: 当前 MVP 范围控制
- **WHEN** 实现当前 MVP 主链路
- **THEN** 系统 SHALL 不要求提供面向用户的图片/OCR 上传主流程，但 Storage 基础设施与访问策略必须已就绪
