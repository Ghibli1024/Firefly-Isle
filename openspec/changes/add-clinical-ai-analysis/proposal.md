## 为什么

Firefly-Isle 已经能把治疗线、初发信息和实验室指标结构化保存下来，也已经提供 `/analytics/:id` 查看趋势。但用户下一步需要的不是更多表格，而是让系统把治疗线和指标趋势转成可读的辅助解释，帮助就医沟通前快速把重点看明白。

## 改什么

- 新增非诊断 AI 分析入口，优先放在 `/record/:id`，可消费当前 `PatientRecord` 与 `labResults`。
- 输出拆成治疗线分析、实验室指标趋势分析、关注点和复核建议。
- 请求继续走 `chat()` / `llm-proxy` / 用户 provider 设置边界，不在前端暴露任何 provider key。
- 无 `labResults` 时降级为治疗线摘要，不编造指标趋势。
- LLM 失败、无记录、无权限、返回 schema 不合法时展示可读失败态。
- 所有文案必须声明“仅作整理和随访沟通参考，不构成诊断或治疗建议”。

## 影响范围

- `openspec/specs/llm-adapter/spec.md` 和 `openspec/specs/llm-provider-settings/spec.md` 的既有边界作为调用约束。
- `src/lib/` 新增或扩展临床分析 prompt/schema 纯逻辑。
- `src/routes/record-page.tsx` 与 `src/routes/record-page.view.tsx` 接入分析状态。
- `src/components/record/` 新增或扩展 AI 分析展示组件。
- 测试覆盖 prompt/schema、无实验室趋势、失败态、无权限记录和非诊断文案。

## 非目标

- 不提供诊断、疾病进展判断、用药或治疗指令。
- 不新增第二套 lab trend 事实存储。
- 不在 P0 做跨患者队列分析。
- 不绕过 `llm-proxy` 或直接接任何模型 SDK。
