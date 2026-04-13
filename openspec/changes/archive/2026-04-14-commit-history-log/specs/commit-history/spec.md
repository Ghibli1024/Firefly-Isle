## ADDED Requirements

### Requirement: docs/log 采用每个 commit 一份日志文件
系统 SHALL 在 `docs/log/` 下按 git 提交粒度维护历史日志，每个 commit 对应一个独立文件，而不是将多个提交混写在单文档中。

#### Scenario: 为单个提交创建日志文件
- **WHEN** 需要为某个已存在的 git commit 记录实现历史
- **THEN** 系统 SHALL 在 `docs/log/` 下创建一份独立 Markdown 文件，并在文件中标明该 commit 的 hash、subject 与时间顺序位置

#### Scenario: 同名 commit 仍能唯一定位
- **WHEN** 历史中存在 subject 相同但 hash 不同的提交
- **THEN** 文件名与正文 SHALL 以 commit hash 作为唯一标识，不得仅用 subject 区分

### Requirement: 每份日志记录实际完成过程与问题
系统 SHALL 为每个 commit 日志记录实际执行步骤、关键文件、遇到的问题与最终验证，而不是只写结果摘要；若有可靠证据，还 SHALL 写出具体使用过的命令。

#### Scenario: 记录一步一步的完成过程
- **WHEN** 为某个 commit 编写日志
- **THEN** 文档 SHALL 说明该提交是如何一步一步完成的，包括起点、关键操作顺序与收口方式；若命令证据存在，还 SHALL 单列这些命令

#### Scenario: 记录问题与阻塞
- **WHEN** 某个提交在完成过程中经历误判、环境阻塞、返工或其他问题
- **THEN** 文档 SHALL 记录这些问题及其处理方式，不得只保留成功结果

#### Scenario: 无法确认具体命令
- **WHEN** 某个提交只能依据 git diff、文档和有限会话线索重建
- **THEN** 文档 SHALL 明确区分已证实命令与未证实命令，不得为了满足格式而编造 CLI 步骤

### Requirement: 日志内容以 git 与证据源为真相源
系统 SHALL 以 git commit 事实为核心真相源，并在日志中补充 OpenSpec 与验证上下文映射。

#### Scenario: git 作为提交事实真相源
- **WHEN** 日志需要写入 commit 标识、subject、顺序与实际存在性
- **THEN** 系统 SHALL 以 `git log` / `git show` 为准，不得臆造或重写提交历史

#### Scenario: OpenSpec 仅补充范围映射
- **WHEN** 日志需要说明某个提交对应的 step 边界或 change 范围
- **THEN** 系统 SHALL 将 `tasks.md`、proposal、design 与运行验证记录作为补充说明来源，而不是替代 git 事实

### Requirement: 日志显式标注证据置信度
系统 SHALL 对每份 commit 日志标明内容是来自直接执行证据还是事后重建，以避免把推断写成事实。

#### Scenario: 高置信度日志
- **WHEN** 某个提交可由完整会话记录、命令输出或明确验证结果支撑
- **THEN** 文档 SHALL 标记为高置信度，并可写出详细过程

#### Scenario: 重建型日志
- **WHEN** 某个提交只能依据 git diff、文件状态与有限文档信息回溯
- **THEN** 文档 SHALL 明确标注为重建结果或待补录，不得伪装成完整的一手记录
