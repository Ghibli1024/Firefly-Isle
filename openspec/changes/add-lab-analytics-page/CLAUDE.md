# add-lab-analytics-page/
> L2 | 父级: /openspec/changes/CLAUDE.md

成员清单
.openspec.yaml: OpenSpec schema 标识，声明本 change 使用 spec-driven 流程，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
proposal.md: 变更动机与范围，锁定 /app 文件输入、网页端统计页、网页端 lab 摄入、Supabase 数据结构与非 Excel 依赖边界，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
design.md: 技术设计，记录 lab_report_batches + lab_results 架构、/app 输入与 /analytics 展示分层、字典/派生/监测规则、选定深色临床控制塔视觉基准与迁移风险，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
specs/: delta 规格目录，覆盖新能力 lab-report-ingestion / lab-analytics-page 与既有 app-shell / lab-result-trends / supabase-schema 变更，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
tasks.md: 当前 apply 进度 checklist，按数据模型、趋势逻辑、网页摄入、统计 UI、安全验证、入口调整与 demo 统计拆分并逐项勾选任务，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 本目录是 active change 的合同与执行账本；归档前不得把这里的规格当成 baseline specs。
