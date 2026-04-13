## Context

`mvp-core` 已经作为 MVP 实现 change 收口完成，但 commit history 类文档仍缺少独立的规格边界。若继续把这类说明混在 `mvp-core` 中，会把“已完成实现”与“后续文档治理”混成一个 change，导致归档与后续维护边界不清。

当前仓库还没有 `docs/log/` 模块，也没有一份可持续维护的 commit history 文档。现有可依赖的真相源只有 `git log`、各个 OpenSpec change 的 artifacts，以及阶段性验证记录。

这个 change 的目标不是改动运行时代码，而是为后续 `docs/log` 文档落地提供独立的 proposal / design / spec / tasks 边界。

## Goals / Non-Goals

**Goals:**
- 为 commit history 文档建立独立于 `mvp-core` 的 OpenSpec change
- 定义 `docs/log/` 下 commit history 文档的目录结构与维护规则
- 约束 commit history 条目与 `git log`、OpenSpec change / tasks、阶段验证结果之间的映射方式
- 明确后续文档补录与增量维护的更新触发条件

**Non-Goals:**
- 改写既有 git 提交历史
- 引入自动从 git 生成文档的脚本或 CI 流程
- 在本 change 内补齐全部 commit history 正文内容
- 修改 `mvp-core` 的需求范围或重新打开已完成的实现 change

## Decisions

### 1. 把 commit history 文档放在 `docs/log/`，并用独立 change 承接
- **Why:** `mvp-core` 是实现变更，`docs/log` 是面向协作者的历史说明，两者生命周期不同。拆开后，后续补录或修订不会污染已完成的实现 change。
- **Alternative considered:** 继续把说明写进 `mvp-core` 的 proposal/design/tasks。放弃，因为会模糊“实现要求”和“历史记录”的边界。

### 2. 采用“每个 commit 一份文件”的目录结构
- **Decision:** 后续实现以 `docs/log/<ordered>-<sha>-<slug>.md` 的方式为每个 commit 建立独立文件，而不是单一入口文档承载全部历史。
- **Why:** 这是用户明确要求的粒度，而且可以避免同名提交混淆，也更方便按时间顺序逐步补录。
- **Alternative considered:** 先用单一 `docs/log/commit-history.md` 统一承载。放弃，因为与已确认需求不一致，并且对同名 commit 的区分能力不足。

### 3. 每条日志都以 git 为真相源，并补充 OpenSpec 映射信息
- **Decision:** commit hash、subject、时间以 `git log` 为准；文档负责补充“对应哪个 OpenSpec change / step 边界、覆盖了什么工作单元、完成了哪些验证”。
- **Why:** git 是提交事实真相源，OpenSpec 是范围真相源，文档只做可读性整理，不能反过来发明历史。
- **Alternative considered:** 只写自然语言总结不记录 hash。放弃，因为不可核对。

### 4. 每份日志必须写“如何一步一步完成”与“遇到过哪些问题”
- **Why:** 用户要的不是 commit 摘要，而是实施过程回顾。若只列 diff 范围，这份日志就失去价值。
- **How:** 能确认的 shell / CLI 指令必须写出来；不能确认的命令必须显式标注“未证实”，而不是为了完整性编造。
- **Alternative considered:** 只记录结果与涉及文件。放弃，因为无法满足复盘目标。

### 5. 用证据置信度区分“直接证据”与“事后重建”
- **Decision:** 后续正文必须显式区分高置信度（一手会话/命令/验证）与重建型日志（由 git/diff/文档反推）。
- **Why:** 早期提交的信息完整度不一，不标注置信度会把推断误写成事实。
- **Alternative considered:** 全部按统一口吻书写。放弃，因为会掩盖证据质量差异。

## Risks / Trade-offs

- **22 个提交意味着 22 份文件，维护成本比单文档高** → 用统一模板、统一命名和 `index.md` 控制可读性
- **手工映射 commit 与 OpenSpec step 可能出错** → 提交 hash / subject 以 git 为准，step 映射需要对照 `tasks.md` 与实际提交边界逐条核对
- **历史提交存在信息不足的情况** → 文档必须显式标注“待补录”或“不确定”，不能臆造范围说明
- **文档维护被误当作实现 change 的一部分** → 在 spec 中明确要求后续更新通过专门的 docs/log change 维护，而不是继续修改 `mvp-core`

