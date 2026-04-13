# 94e2828 feat: add patient record extraction flow

## 1. 基本信息
- Commit: `94e2828`
- Message: `feat: add patient record extraction flow`
- 时间顺序: 0014
- 日期: 2026-04-12
- 在当前仓库中的定位: `mvp-core` Commit 6（6.1 ~ 6.8）的核心提交

## 2. 这次提交实际解决了什么
- 把“用户输入病史 → 得到结构化 `PatientRecord`”这条主链路真正接上了。
- 落地了 prompt schema、JSON 解析、类型归一化、关键缺失字段检测、最多 3 轮追问与 merge 逻辑。
- 工作区 `/app` 开始具备真实提取状态机，而不只是壳层输入框。

## 3. 是怎么一步一步完成的
1. 先写 `src/lib/extractionPrompt.ts`，把 `PatientRecord` 的 TypeScript 结构直接塞进 prompt，确保模型输出目标不是模糊自然语言，而是受 schema 约束的 JSON。
2. 再写 `src/lib/extraction.ts`，把提取过程拆成几个明确阶段：
   - 去 markdown fence
   - `JSON.parse`
   - 数值/日期归一化
   - 关键缺失字段识别
   - follow-up 问句生成
   - merge 规则
3. 把这套状态机接进 `src/routes/workspace-page.tsx`，让 `/app` 真正拥有：
   - 初次提取
   - 最多 3 轮追问
   - parse error 提示
   - retry
   - 最近记录恢复
4. 再回头补双主题下的错误恢复与重试入口，避免 dark 做完、light 缺口留着。
5. 最后同步 `README.md` 与 `openspec/changes/mvp-core/tasks.md`，把“有提取主链路”这件事写回文档真相源。
6. 已证实命令：当前材料没有保留这次提交当天的完整 shell 序列。
7. 未证实命令：可以合理推断过程中执行过构建/校验与浏览器验证，但没有可直接引用的原始命令记录，因此不写成确定事实。

## 4. 遇到的问题
- 我曾误建过 `src/lib/extraction/CLAUDE.md` 这种多余目录，但真实文件并不在那个子目录里，发现后立刻删除，避免文档结构与代码现实脱节。
- 工作区状态里一度出现 `rawResult` / `retryFromRaw` 这种半接好的状态字段，后来重构成 `retryMode` / `retryAnswer` 才把 retry 语义说清楚。
- light 主题最初没有完全补齐重试路径，说明同一功能在双主题下的 parity 不能只做一半。

## 5. 证据
- `git show --stat 94e2828`: 核心文件是 `src/lib/extraction.ts`、`src/lib/extractionPrompt.ts`、`src/routes/workspace-page.tsx`
- README 与 tasks 同步更新，表明 6.x 是“主流程能力变更”而不只是内部实现
- 后续 timeline / edit / export 都建立在这次提取链路之上

## 6. 我的判断
- 这是整个产品从“有登录和壳层”迈向“真正有临床工作价值”的第一笔核心提交。
- 之后的时间线渲染、编辑、导出，都只是围绕这次提取结果展开。

## 7. 置信度
- 当前等级: 高
- 原因: 有完整代码证据、状态机修正记录以及后续功能对它的依赖关系可佐证。
