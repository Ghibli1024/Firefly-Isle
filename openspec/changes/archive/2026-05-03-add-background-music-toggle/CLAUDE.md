# add-background-music-toggle/
> L2 | 父级: /CLAUDE.md

成员清单
CLAUDE.md: active change 局部地图，说明背景音乐自动播放与关闭控制 artifacts 的职责边界，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
proposal.md: 说明为什么将 P2 背景音乐想法收敛为全局可控、可恢复、可测试的应用能力，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
design.md: 记录单一 audio provider、自动播放拦截状态、偏好持久化、共享音乐控制与本地资产边界，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
tasks.md: 执行清单，按上下文与资产边界、测试先行、核心实现、文档验证拆分，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
specs/: background-audio 新能力与 app-shell delta spec，约束全局音乐状态、关闭恢复、自动播放拦截和壳层控制位置，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
.openspec.yaml: OpenSpec schema 元数据，声明本 change 使用 spec-driven workflow，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 音乐是全局状态；关闭必须被尊重；浏览器拒绝自动播放不是异常，是现实。
