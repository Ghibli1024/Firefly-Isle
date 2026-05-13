<!--
 * [INPUT]: 依赖 docs/products/prd-implementation-status.md 的 v1.4.0+P0 工作树实现盘点，依赖 openspec/specs/ 的 baseline 行为，并参考 openspec/changes/add-lab-analytics-page/ 与三个 P0 active changes 的实现合同。
 * [OUTPUT]: 对外提供当前 P0 落地状态、下一阶段产品能力优先级、排序理由与推荐 OpenSpec 切分。
 * [POS]: docs/products 的产品路线图排序文件，区别于 PRD 实现状态盘点，负责回答“P0 已推进到哪、下一步先做什么”。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 -->

# 产品优先级路线图

## 当前基准

- 当前发布基线：`v1.4.0` / `2a1bd34`。
- 当前已完成待归档 change：`add-lab-analytics-page`，任务 `32/32` 完成，仍作为统计页实现账本直到归档进 baseline specs。
- 当前 P0 active changes：`add-clinical-ai-analysis`、`add-secure-record-sharing`、`restore-minimal-timeline-table-view` 已实现并等待最终验证 / 归档。
- 当前验证：以本轮最终验证命令为准；P0 聚焦验证已覆盖 AI 分析、分享、record page 视图切换与 app route 合同。
- 当前产品事实：网页端统计入口、实验室报告摄入、`lab_results` 趋势视图、对话式修改、治疗甘特图、用户 LLM provider 设置、AI 辅助分析、授权码只读分享和极简 TimelineTable 视图都已落地；下一步从“可分析、可协作、可一页讲清”进入真实用户配置与发布前打磨。

## 排序原则

- 先把已实现的数据能力变成用户看得见的产品入口，再扩展 AI 分析与协作。
- 先做能提高治疗信息可信度、可读性和复用率的能力，再做情绪化、社区化或平台化能力。
- 单一真相源优先：实验室趋势最终落到 Supabase `lab_results`，不复制到 `treatmentLines`；统计页面只从结构化实验室读数计算视图、图表和监测提示，不持久化第二套趋势结论。
- 已完成待归档的 change 不再拆成新需求重复实现；新需求只消费它暴露出的 PatientRecord、`lab_results` 与页面入口。

## 已完成里程碑

- `add-record-treatment-gantt-view`：已完成并归档，当前 baseline 为 `/record/:id` 档案 / 甘特图切换。
- `add-medical-document-ocr`：已完成并归档，当前 baseline 为图片 / PDF OCR、文本确认与现有提取链路复用。
- `add-lab-result-trends`：已完成并归档，当前 baseline 为 `labResults` 数据结构、持久化、基础趋势表与非诊断持续增高提示。
- `add-conversational-record-editing`：已完成并归档，当前 baseline 为已有记录自然语言编辑和字段级 merge。
- `add-user-llm-provider-settings`：已完成并归档，当前 baseline 为系统 DeepSeek、用户 preset / custom provider、服务端加密与 RLS 隔离。
- `add-lab-analytics-page`：已完成待归档，当前实现为 `/app` 病历 / 检验报告文件输入、`/analytics/:id` 统计入口、`/analytics/demo` 演示统计页、`lab_report_batches` 批次能力、分组趋势图、等价数据表、最近异常汇总与肿瘤标志物连续上涨提醒。

## P0 本轮完成（待归档）

1. AI 助理分析治疗方案和血液指标
   - 状态：已接入 `/record/:id` dossier，使用 `chat()` / `llm-proxy` / provider 设置边界生成非诊断 JSON 分析。
   - 边界：只做辅助解释，不给确定诊断、治疗指令或用药建议；没有实验室趋势时降级为治疗线摘要。
   - Change：`add-clinical-ai-analysis`

2. 加密分享 / 授权码分享
   - 状态：已新增 `record_shares`、授权码 hash、可撤销/可过期分享入口和公开只读 `/share/:code` 路由。
   - 边界：授权码明文只展示一次；公开访问只读单份记录，不暴露原始 user id，不接入编辑、导出或 AI 分析动作。
   - Change：`add-secure-record-sharing`

3. 一页极简表格 / TimelineTable 回归主链路
   - 状态：已把 `/record/:id` 和 `/record/demo` 的视图切换扩展为 dossier / 极简表格 / Gantt 三态。
   - 边界：复用现有 `PatientRecord` 与 `TimelineTable`，不复制第二套治疗线编辑逻辑；PDF / PNG 导出仍归 dossier。
   - Change：`restore-minimal-timeline-table-view`

## P1 重要但不抢主链路

4. 微信登录
   - 价值：中国用户真实测试前值得补；当前 Cloudflare Pages Functions 适配层已有预工作。
   - 边界：必须完成微信开放平台、Supabase provider、回调域名与 session 恢复 live verification 后才能从“敬请期待”变为可点击。

5. 手机验证码
   - 价值：中国用户友好。
   - 边界：需要短信服务、成本、风控、滥用防护和测试手机号策略，不应半接入。

6. MSD 健康查询
   - 价值：有参考意义，但属于外部内容入口，不是当前病历主骨架。

## P2 暂缓

7. 每日鼓励语、许愿墙、拥抱动画欢迎页
   - 原因：能增加温度，但当前阶段不如 AI 分析、受控分享和一页极简表格重要。

8. Windows / Mac / Android / iOS / 小程序 / 鸿蒙原生版本
   - 原因：先让 Web 产品跑通真实病历场景，再扩平台。

9. OpenClaw / WebChrome 扩展集成
    - 原因：除非确定为获客或固定工作流入口，否则会分散核心架构注意力。

## 推荐执行顺序

1. 完成三个 P0 active changes 的最终验证并归档进 baseline specs。
2. `add-wechat-auth`
3. `add-phone-otp-auth`
4. 真实用户试用前的分享安全审计与可用性打磨。

统计入口已经从“藏在档案页里的能力”变成网页端主入口，文件上传回到 `/app` 输入区统一承接；P0 又补上 AI 分析、受控分享和一页极简表格回归。下一步不应再扩散新主线，先把 active changes 归档并做真实配置验证。

## OpenSpec 切分建议

- `add-clinical-ai-analysis` 只做分析生成、展示、免责声明与失败态，不顺手做分享或新上传入口。
- `add-secure-record-sharing` 只做只读授权与撤销，不把协作编辑、评论、医生账户体系塞进第一版。
- `restore-minimal-timeline-table-view` 只复用已有 `TimelineTable` 与 PatientRecord，不复制第二套治疗线编辑逻辑。
- `add-wechat-auth` 必须以真实微信开放平台配置和回调验证为准；缺配置时保留可解释失败，不伪装可用。
