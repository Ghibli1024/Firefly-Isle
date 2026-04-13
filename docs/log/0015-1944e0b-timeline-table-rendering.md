# 1944e0b feat: add timeline table rendering

## 1. 基本信息
- Commit: `1944e0b`
- Message: `feat: add timeline table rendering`
- 时间顺序: 0015
- 日期: 2026-04-12
- 在当前仓库中的定位: `mvp-core` Commit 7（7.1 ~ 7.5）的核心提交

## 2. 这次提交实际解决了什么
- 正式引入 `TimelineTable` 与各个区块组件，把提取结果从文本/临时预览提升为规范化时间线表格。
- 将三种 archetype（non-advanced / de-novo-advanced / relapsed-advanced）的渲染差异收口到统一组件里。
- 明确只高亮临床关键缺失字段，不再用 `undefined` / `?` 之类破坏可读性。

## 3. 是怎么一步一步完成的
1. 先在 `src/components/timeline/TimelineTable.tsx` 里建立统一主组件，而不是继续让 `workspace-page.tsx` 直接拼临时预览块。
2. 把表格内部拆成稳定区块：
   - `BasicInfoBlock`
   - `InitialOnsetBlock`
   - `TreatmentLineBlock`
   让不同患者 archetype 的差异回到组件层解决。
3. 用 `getPatientArchetype()` 控制区块显隐，避免在 route 层散落大量 if/else 逻辑。
4. 把 `workspace-page.tsx` 从“文本提取后临时展示”切换成“提取后交给正式表格组件承接”。
5. 收口时同步 `src/components/timeline/CLAUDE.md` 与 `src/routes/CLAUDE.md`，把新增模块入口补进文档系统。
6. 已证实命令：当前没有保留下可直接引用的原始 shell 命令。
7. 未证实命令：虽然这次提交显然经历过本地构建与页面检查，但现有材料不足以把命令链写死，因此不补猜测值。

## 4. 遇到的问题
- 这一步最大的难点不是写表格，而是守住显示规则：只有 `tumorType`、`stage`、`regimen` 该被强提醒，其他空字段必须安静留白。
- `workspace-page.tsx` 在此时已经开始变胖，但为了把主链路先接通，仍然暂时接受它承载更多组合逻辑。

## 5. 证据
- `git show --stat 1944e0b`: 关键新增 `src/components/timeline/TimelineTable.tsx`
- `mvp-core` 任务 7.1 ~ 7.5 与该提交形成一一对应
- 后续 editable/export 都直接在这份表格基础上增量实现

## 6. 我的判断
- 这是一笔“让结果第一次长成产品核心界面”的提交。
- 没有它，提取结果就仍然只是中间态数据，不足以支撑就诊场景中的一页纸沟通。

## 7. 置信度
- 当前等级: 高
- 原因: 代码结构清晰、任务映射明确，且后续多笔提交直接建立在这份表格之上。
