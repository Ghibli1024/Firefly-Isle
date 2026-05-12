# supabase/migrations/
> L2 | 父级: /supabase/CLAUDE.md

成员清单
CLAUDE.md: 说明迁移目录职责与命名规则，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
001_init.sql: 建立 patients、treatment_lines、RLS 与 updated_at trigger 的首个 MVP 迁移，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
002_lab_results.sql: 建立 lab_results、趋势索引、级联删除与基于 patients.user_id 的 RLS policy，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
003_llm_provider_settings.sql: 建立 llm_provider_settings、加密 key 字段、provider/model 约束、updated_at trigger 与 owner RLS policy，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
004_patient_clinical_notes.sql: 为 patients 增加 clinical_notes 文本列，承载临床备注与原“其他信息”内容，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
005_lab_report_batches.sql: 建立 lab_report_batches 批次事实表，并为 lab_results 增加 batch_id、is_derived、derivation_method 以支持网页端实验室报告摄入，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
llm-provider-settings.test.ts: 迁移合同测试，约束 llm_provider_settings 不含明文 key 列、preset/custom model 约束与四类 owner RLS policy，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 每个迁移都是一次可审计的数据库事实，不把 schema 变化散落到别处。
