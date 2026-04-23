# flatten-workspace-report-shell/
> L2 | 父级: /CLAUDE.md

成员清单
proposal.md: 说明工作区报告预览去壳的用户动因、影响范围与不触碰提取/导出状态机的边界，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
design.md: 记录 route 层去标题壳、feature 层去外框、TimelineTable 直接成为主表面的设计决策，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
tasks.md: 执行清单，只反映红灯测试、实现、文档同步与验证的真实状态，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
specs/: app-shell delta spec，定义 `/app` 报告区不再额外渲染总标题壳，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 工作区报告区直接进入时间线主表面，不再用总标题壳重复包装。
