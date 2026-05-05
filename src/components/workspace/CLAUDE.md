# src/components/workspace/
> L2 | 父级: /src/components/CLAUDE.md

成员清单
CLAUDE.md: 说明 workspace feature 层职责边界与成员清单，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
extraction-composer.tsx: 工作区输入与主操作区，收口文本输入、OCR 文件导入、语音工具、OCR 文本确认、自然语言编辑反馈、错误提示、状态反馈与唯一主提取动作，不承载正式导出入口，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
follow-up-panel.tsx: 工作区追问补充区，承载当前问题、补充输入与提交动作，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
llm-provider-settings-panel.tsx: 工作区模型设置区块，渲染可收起的系统内置 DeepSeekV4、API 自提供、自定义 provider 设置入口、模式字段映射与第三方医疗数据披露，并调用前端 provider settings client 保存设置，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
llm-provider-settings-panel.test.ts: 模型设置字段显隐合同测试，约束系统内置无第二行、API 自提供显示 Provider/API Key/模型名、自定义显示 Base URL/API Key/模型名且 URL 在前，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
report-preview-frame.tsx: V3 工作区病历预览主表面，内联渲染缺失字段告警、基本信息网格、横向治疗线、临床备注、验证状态，并保留 setReportRef 导出捕获点，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: feature 层承载页面业务结构块；/app 做输入、提取、模型设置与草稿预览，正式导出属于 /record/:id。
