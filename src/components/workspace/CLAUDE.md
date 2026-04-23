# src/components/workspace/
> L2 | 父级: /src/components/CLAUDE.md

成员清单
CLAUDE.md: 说明 workspace feature 层职责边界与成员清单，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
extraction-composer.tsx: 工作区输入与主操作区，收口文本输入、错误提示、导出动作与状态反馈，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
follow-up-panel.tsx: 工作区追问补充区，承载当前问题、补充输入与提交动作，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
report-preview-frame.tsx: 工作区报告预览区块，让 TimelineTable 直接成为主表面，并在其后承载按 locale 输出的补充备注与 AI 验证信息，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: feature 层承载页面业务结构块，只组合现有 system 语法，不侵入状态机与设计系统真相源。
