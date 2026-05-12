# specs/
> L2 | 父级: /openspec/changes/add-lab-analytics-page/CLAUDE.md

成员清单
app-shell/spec.md: 修改壳层规格，让侧栏统计入口进入真实 /analytics/:id 或无输入 /analytics/demo 并复用 V3 已登录 shell，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
lab-analytics-page/spec.md: 新增统计页规格，定义 /analytics/:id、/analytics/demo、分组指标、网页折线图、等价表格、最近异常与肿瘤标志物连续上涨提醒，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
lab-report-ingestion/spec.md: 新增网页端 lab 报告摄入规格，定义 /app 输入区上传、OCR、结构化确认、Supabase 批次保存与派生 CBC 指标，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
lab-result-trends/spec.md: 扩展趋势逻辑规格，定义分类最近异常、肿瘤指标连续两段 >20% 上涨与图表序列输出，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
supabase-schema/spec.md: 扩展 Supabase schema 规格，新增 lab_report_batches 并扩展 lab_results batch/derived 元数据，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: delta spec 只描述本 change 的新增/修改要求；归档后再并入 /openspec/specs baseline。
