## ADDED Requirements

### Requirement: 用户可为单份真实病历创建只读分享
系统 SHALL 允许记录所有者为单份真实 PatientRecord 创建只读分享。

#### Scenario: 创建分享
- **WHEN** 已认证用户在自己拥有的真实 `/record/:id` 上创建分享
- **THEN** 系统 SHALL 生成高熵授权码或分享链接
- **AND** 数据库 SHALL 只保存授权码 hash
- **AND** 分享 SHALL 关联该 patient record，而不是授予全账户访问权

#### Scenario: demo 记录不创建分享
- **WHEN** 用户访问 `/record/demo`
- **THEN** 系统 SHALL NOT 创建真实分享

### Requirement: 分享访问只读且限定单份记录
系统 SHALL 允许持有有效授权码的访问者只读查看被授权的单份记录。

#### Scenario: 授权码有效
- **WHEN** 访问者打开有效且未过期、未撤销的分享链接
- **THEN** 系统 SHALL 渲染对应 PatientRecord 的只读视图
- **AND** 页面 SHALL NOT 提供字段编辑、保存或删除能力
- **AND** 页面 SHALL NOT 允许访问同一用户的其他记录

### Requirement: 分享可撤销可过期
系统 SHALL 支持所有者撤销分享，并支持分享过期。

#### Scenario: 分享被撤销
- **WHEN** 所有者撤销某条分享
- **THEN** 后续使用该授权码访问 SHALL 被拒绝
- **AND** 页面 SHALL 显示可读的撤销状态

#### Scenario: 分享已过期
- **WHEN** 访问者使用已超过 `expires_at` 的授权码
- **THEN** 系统 SHALL 拒绝访问
- **AND** 页面 SHALL 显示可读的过期状态

### Requirement: 错误授权码不泄露记录存在性
系统 SHALL 对错误授权码显示中性失败反馈。

#### Scenario: 授权码不存在或格式错误
- **WHEN** 访问者提交不存在、格式错误或 hash 不匹配的授权码
- **THEN** 系统 SHALL 显示分享不可用
- **AND** 系统 SHALL NOT 暴露 patient id、owner user id 或记录是否存在
