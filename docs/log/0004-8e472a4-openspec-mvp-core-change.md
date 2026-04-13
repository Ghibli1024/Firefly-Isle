# 8e472a4 chore: add openspec mvp-core change with opsx skills and commands

## 1. 基本信息
- Commit: `8e472a4`
- Message: `chore: add openspec mvp-core change with opsx skills and commands`
- 时间顺序: 0004
- 日期: 2026-03-30
- 在当前仓库中的定位: `mvp-core` 的规格化起点 / 本地 OpenSpec 工作流引入

## 2. 这次提交实际解决了什么
- 在仓库里引入了本地 `opsx:*` 命令与 OpenSpec skill，使后续实现可以围绕 spec-driven 流程推进。
- 同时第一次落下了 `openspec/changes/mvp-core/` 的 proposal、design、specs、tasks 全套骨架，让 MVP 从想法变成可执行 change。

## 3. 是怎么一步一步完成的
1. 先为 Claude Code 本地工作流补齐命令和 skill 文件：
   - `.claude/commands/opsx/*`
   - `.claude/skills/openspec-*`
   让后续 apply / explore / propose / archive 有统一入口。
2. 再创建 `openspec/changes/mvp-core/`，一次性种下 proposal、design、specs、tasks 与 `.openspec.yaml`。
3. 然后把产品能力拆成若干 capability spec，使后续实现不再围绕口头需求，而围绕仓库内工件推进。
4. 已证实命令：无。
5. 高度推定但未证实命令：`openspec new change "mvp-core"`。`mvp-core/.openspec.yaml` 与 change 目录结构强烈支持这一点，但缺少原始命令输出。

## 4. 遇到的问题
- 这是一笔非常大的“规格化种子提交”，范围广但没有运行时代码，因此后续仍需要多次补齐 baseline 与实现现实之间的差距。
- 一开始的 specs 更像第一次框架化表达，后续大量细节仍要随着真实实现反复收紧。

## 5. 证据
- `git show --stat 8e472a4`: 同时新增 `.claude/commands`、`.claude/skills` 与 `openspec/changes/mvp-core/*`
- `openspec/changes/mvp-core/tasks.md`: 已明确 recommended commit map 与阶段步骤

## 6. 我的判断
- 这是整个项目从“普通仓库”切换为“spec-driven 仓库”的关键前置提交。
- 后面所有实现节奏、提交边界与 apply 流程，基本都受它影响。

## 7. 置信度
- 当前等级: 中
- 原因: diff 与新增文件非常明确，但当时完整对话上下文不足，只能从产物反推其形成过程。
