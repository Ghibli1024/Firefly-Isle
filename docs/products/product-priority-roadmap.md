<!--
 * [INPUT]: 依赖 docs/products/prd-implementation-status.md 的当前实现盘点，依赖 openspec/specs/ 的 baseline 行为，并参考 openspec/changes/add-lab-analytics-page/ 的已完成待归档统计页合同。
 * [OUTPUT]: 对外提供下一阶段产品能力优先级、排序理由与推荐 OpenSpec 切分。
 * [POS]: docs/products 的产品路线图排序文件，区别于 PRD 实现状态盘点，负责回答“下一步先做什么”。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 -->

# 产品优先级路线图

## 排序原则

- 先把已实现的数据能力变成用户看得见的产品入口，再扩展 AI 分析与协作。
- 先做能提高治疗信息可信度、可读性和复用率的能力，再做情绪化、社区化或平台化能力。
- 单一真相源优先：实验室趋势最终落到 Supabase `lab_results`，不复制到 `treatmentLines`；统计页面只从结构化实验室读数计算视图、图表和监测提示，不持久化第二套趋势结论。

## 已完成里程碑

- `add-record-treatment-gantt-view`：已完成并归档，当前 baseline 为 `/record/:id` 档案 / 甘特图切换。
- `add-medical-document-ocr`：已完成并归档，当前 baseline 为图片 / PDF OCR、文本确认与现有提取链路复用。
- `add-lab-result-trends`：已完成并归档，当前 baseline 为 `labResults` 数据结构、持久化、基础趋势表与非诊断持续增高提示。
- `add-conversational-record-editing`：已完成并归档，当前 baseline 为已有记录自然语言编辑和字段级 merge。
- `add-user-llm-provider-settings`：已完成并归档，当前 baseline 为系统 DeepSeek、用户 preset / custom provider、服务端加密与 RLS 隔离。
- `add-lab-analytics-page`：已完成待归档，当前实现为 `/app` 病历 / 检验报告文件输入、`/analytics/:id` 统计入口、`/analytics/demo` 演示统计页、`lab_report_batches` 批次能力、分组趋势图、等价数据表、最近异常汇总与肿瘤标志物连续上涨提醒。

## P0 下一步

1. AI 助理分析治疗方案和血液指标
   - 价值：在结构化病历、实验室趋势和 provider 设置稳定后，提供更高价值的辅助解释。
   - 边界：输出必须是辅助信息，不给确定诊断或治疗指令；没有实验室趋势时降级为治疗线摘要。
   - 推荐 change：`add-clinical-ai-analysis`

2. 加密分享 / 授权码分享
   - 价值：面向家属、医生、病友协作，让单份病历可以受控只读分享。
   - 边界：必须有过期或撤销机制；授权码不得暴露原始 user id；分享访问不能绕过 RLS。
   - 推荐 change：`add-secure-record-sharing`

3. 一页极简表格 / TimelineTable 回归主链路
   - 价值：收束产品表达，让 PRD 的“一页看懂”重新成为核心体验，而不是只保留 V3 档案式表达。
   - 边界：先作为 `/record/:id` 或工作区的可切换视图，不破坏现有 dossier、Gantt、PDF / PNG 导出。
   - 推荐 change：`restore-minimal-timeline-table-view`

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

1. `add-clinical-ai-analysis`
2. `add-secure-record-sharing`
3. `restore-minimal-timeline-table-view`
4. `add-wechat-auth`

统计入口已经从“藏在档案页里的能力”变成网页端主入口，文件上传则回到 `/app` 输入区统一承接。下一步应让 AI 分析消费同一份 `lab_results` 和治疗线数据，再补受控分享与一页极简表格回归。
