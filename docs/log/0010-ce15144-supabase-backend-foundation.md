# ce15144 feat: add Supabase backend foundation

## 1. 基本信息
- Commit: `ce15144`
- Message: `feat: add Supabase backend foundation`
- 时间顺序: 0010
- 日期: 2026-04-11
- 在当前仓库中的定位: `mvp-core` Commit 3 的代码基础 / 数据库与基础设施边界首次落盘

## 2. 这次提交实际解决了什么
- 在仓库里新增 `supabase/migrations/001_init.sql`，定义 `patients`、`treatment_lines`、RLS 与 `updated_at` trigger。
- 同步建立 `supabase/CLAUDE.md` 与 `supabase/migrations/CLAUDE.md`，把 BaaS 基础设施目录纳入文档系统。

## 3. 是怎么一步一步完成的
1. 先把当前 MVP 所需的数据模型翻译成 SQL 迁移文件，集中落在 `supabase/migrations/001_init.sql`。
2. 在同一份迁移里把 RLS、owner-only policy 与 trigger 一起写死，避免前端承担权限逻辑。
3. 再补 supabase 目录的 L2 文档，让后续 Auth / Edge Function / Storage 的边界有明确落点。
4. 已证实命令：无。
5. 推定但未证实命令：虽然文件名像是手工命名迁移，理论上可能执行过 `supabase migration new 001_init.sql` 或同类动作，但当前没有可直接引用的命令记录。

## 4. 遇到的问题
- 这次提交只把“仓库内基础设施定义”落下来，真正的 Dashboard 执行、region 选择、bucket 创建和策略验证，是后续实现阶段才逐步完成的。
- 所以它是 Commit 3 的代码基础，不等于 Commit 3 的全部现实完成度。

## 5. 证据
- `git show --stat ce15144`: 关键变更集中在 `supabase/migrations/001_init.sql` 与 supabase 目录文档
- `mvp-core` 任务 3.1 ~ 3.3 与之直接对应

## 6. 我的判断
- 这次提交的重要性在于“先把数据库边界写死”，后续才有资格接 Auth 与持久化。
- 它是典型的基础设施先行提交。

## 7. 置信度
- 当前等级: 中
- 原因: diff 与任务映射很明确，但执行 Dashboard 细节不在本提交里，属于中等置信度重建。
