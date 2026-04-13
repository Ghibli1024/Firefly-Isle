## Why

`mvp-core` 已经承载并完成了 MVP 实现范围，提交历史说明类文档如果继续挂在该 change 下，会把“已完成实现”与“后续文档治理”混在一起。需要把 commit history 文档单独拆成一个 docs/log 专用 change，让后续整理、补录与维护有独立的规格边界。

## What Changes

- 新建独立的 `commit-history-log` OpenSpec change，专门承接 `docs/log` 下的 commit history 文档能力
- 定义 commit history 文档的目标位置、记录粒度、条目结构与更新触发条件
- 约束 commit history 文档与 OpenSpec change / milestone commit / 仓库现状之间的对齐方式，避免再次混入 `mvp-core`

## Capabilities

### New Capabilities
- `commit-history-log`: 规范 `docs/log` 下的 commit history 文档结构、内容来源、更新节奏与链接关系

### Modified Capabilities
- 无

## Impact

- OpenSpec: `openspec/changes/commit-history-log/` 新增 proposal / design / specs / tasks 工件
- Docs: 后续实现会新增 `docs/log/` 目录及其 commit history 文档
- Documentation governance: commit 说明将从 `mvp-core` 的完成态实现 change 中解耦，转入单独文档 change 维护
