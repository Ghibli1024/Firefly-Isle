# specs/
> L2 | 父级: /CLAUDE.md

成员清单
app-shell/spec.md: 页面壳层、路由范围、登录入口与 feature 组件边界的 baseline spec，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
asset-storage/spec.md: Supabase Storage 基础设施、用户隔离与 MVP 上传范围的 baseline spec，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
auth/spec.md: 邮箱登录、密码重置、Google OAuth、匿名模式、隐私条款门控与 session 持久化的 baseline spec，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
commit-history/spec.md: docs/log 提交日志粒度、证据来源与置信度标注的 baseline spec，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
deployment/spec.md: 部署入口、Cloudflare Pages 与发布控制的 baseline spec，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
editing/spec.md: 时间线表格字段编辑、blur 保存、空白高亮与布局稳定性的 baseline spec，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
export/spec.md: 正式档案导出、PDF/PNG 行为与导出边界的 baseline spec，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
info-extraction/spec.md: 自然语言提取、关键字段追问、三轮上限与 LLM JSON 约束的 baseline spec，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
llm-adapter/spec.md: chat 适配器、Edge Function 代理、模型参数与错误处理的 baseline spec，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
patient-record/spec.md: PatientRecord 数据结构、治疗线与三类患者判定的 baseline spec，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
supabase-schema/spec.md: Supabase 表结构、RLS、区域选择与 updated_at 触发器的 baseline spec，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
theme-system/spec.md: Dark/Light 主题 token、surface、登录视觉合同与主题切换的 baseline spec，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
timeline-table/spec.md: 时间线表格渲染、检测信息归属、空字段与基本信息顺序的 baseline spec，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 主规格必须是 baseline，不再保留 `## ADDED Requirements` / `## MODIFIED Requirements` 这类 delta 头。
