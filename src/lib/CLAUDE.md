# src/lib/
> L2 | 父级: /src/CLAUDE.md

成员清单
CLAUDE.md: 说明前端基础设施模块职责，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
theme.tsx: Dark / Light 主题状态、持久化与 document 根节点主题标记同步，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
locale.tsx: 全局 locale 状态中心，负责 zh / en 切换、持久化恢复与 useLocale 消费入口，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
copy.ts: app shell、login、workspace、record 的语言真相源，禁止组件继续内联双语字符串，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
export-record.ts: 正式病历导出工具，复用 html2canvas 与 jsPDF 生成 PDF/PNG，供 /record/:id 独占消费，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
export-record.test.ts: 正式病历导出工具回归测试，约束 PDF/PNG 继续走共享截图、分页、下载链路，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
theme/: 设计系统 token 目录，收敛 surface、text、border、accent 与 motion 真相源
auth.tsx: Supabase session 恢复、认证状态广播与 signOut 边界，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
llm/: 前端 LLM adapter 目录，收敛 chat 接口、类型与错误映射
extractionPrompt.ts: PatientRecord schema 提示词模板与 JSON 输出约束边界，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
extraction.ts: 信息提取主链路，负责解析、归一化、关键缺失字段检测、追问 merge、解析错误语义与 follow-up runner，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
privacy.ts: 隐私页 href、隐私门控确认 key 与共享隐私文案真相源，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
supabase.ts: Supabase 客户端初始化与环境变量边界，区分 Auth 所需 env 与 Edge Function 所需 env，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
utils.ts: 类名合并等无业务状态工具，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 基础设施集中在这里，页面只消费结果，不重复发明边界。
