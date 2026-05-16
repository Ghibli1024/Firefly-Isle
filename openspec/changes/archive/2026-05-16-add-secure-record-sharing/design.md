## 设计决策

### 决策 1：新增 record_shares 表

分享事实放入 Supabase：`record_shares(id, patient_id, owner_user_id, code_hash, expires_at, revoked_at, created_at)`。`patient_id` 关联 `patients`，`owner_user_id` 记录创建者，授权码只保存 hash。

### 决策 2：授权码只读

分享访问通过授权码定位一条未撤销、未过期的 share，再读取对应 PatientRecord。P0 只读，不允许编辑、保存或删除。

### 决策 3：撤销优先

撤销通过写入 `revoked_at` 完成。即使 `expires_at` 仍未到期，只要已撤销就拒绝访问。

### 决策 4：UI 入口放在真实档案页

只有真实 `/record/:id` 且当前用户拥有记录时显示创建/撤销入口。`/record/demo` 不提供真实分享。

### 风险

- 授权码泄露：使用随机高熵 code，数据库只存 hash，并提供撤销。
- RLS 绕过：owner 管理和 share 访问必须有清晰查询边界，测试覆盖错误码、撤销和过期。
- 分享视图误导可编辑：分享路由必须禁用编辑和保存。
