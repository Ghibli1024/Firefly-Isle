## 设计决策

### 决策 1：分析是 PatientRecord 的派生视图，不是新事实

AI 分析结果由当前记录和实验室读数即时生成。P0 不把分析结论持久化成数据库事实，避免与原始病历和 `lab_results` 漂移。

### 决策 2：使用显式输出 schema

前端 prompt 要求 LLM 返回 JSON：`treatmentSummary[]`、`labTrendSummary[]`、`attentionPoints[]`、`followUpQuestions[]`、`disclaimer`。解析失败时进入失败态，不把原始模型长文直接当正式分析展示。

### 决策 3：无 labResults 时降级

当记录没有实验室读数时，分析只输出治疗线/病历摘要，并明确“暂无已保存实验室指标，无法生成指标趋势分析”。系统不得伪造 demo 指标。

### 决策 4：入口放在档案页

`/record/:id` 是正式病历和导出的主入口，因此 AI 分析放在档案页更符合用户心智。统计页可后续复用同一分析模块，但 P0 不强行双入口。

### 风险

- LLM 输出越界：通过 system prompt、schema 校验和非诊断文案约束。
- Provider 配置失败：复用 `ChatError`，展示可重试失败态。
- 记录越权：只用现有 `loadPatientRecordById` 读取当前用户可见记录。
