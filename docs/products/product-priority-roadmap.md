<!--
 * [INPUT]: 依赖 docs/products/prd-implementation-status.md 的实现盘点，依赖当前产品讨论中的甘特图视图与多平台 LLM API 需求。
 * [OUTPUT]: 对外提供下一阶段产品能力优先级、排序理由与推荐 OpenSpec 切分。
 * [POS]: docs/products 的产品路线图排序文件，区别于 PRD 实现状态盘点，负责回答“下一步先做什么”。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 -->

# 产品优先级路线图

## 排序原则

- 先补核心病历闭环，再扩展模型平台与增长入口。
- 先做能提升治疗信息可信度与可读性的能力，再做情绪化、社区化或平台化能力。
- 单一真相源优先：已有 `PatientRecord` 能表达的能力，先做视图投影；需要新数据模型的能力，进入独立 OpenSpec change。

## P0 立即做

1. 上传 / 拍照 OCR
   - 价值：直接降低病历录入成本，是从“手动粘贴病史”进入真实使用场景的第一关。
   - 推荐 change：`add-medical-document-ocr`

2. 血常规、血生化、肿瘤标志物识别与趋势表格
   - 价值：补齐 PRD 的第二条主链路，让产品从病历摘要工具进化为治疗管理工具。
   - 推荐 change：`add-lab-result-trends`

3. 输入框中对话式修改
   - 价值：让用户能用自然语言修正已有结构化病历，减少表格逐格编辑成本。
   - 推荐 change：`add-conversational-record-editing`

4. `/record/:id` 治疗线甘特图视图
   - 价值：不改变核心数据模型，只把 `treatmentLines` 投影为治疗持续时间、换线节点与当前治疗线，一眼看清治疗线节奏。
   - 排序：P0。它是低成本高收益的核心视图能力，能直接提高正式档案页的信息密度。
   - 边界：第一版只放在正式档案页，不进入 `/app` 工作区草稿预览。
   - 推荐 change：`add-record-treatment-gantt-view`

5. 多平台 LLM API 适配与用户自填 API
   - 价值：降低单一模型依赖，支持 Gemini、Claude、OpenAI、GLM、DeepSeek、Kimi 与自定义兼容接口。
   - 排序：P0。模型可用性、成本、地区访问与用户自带 key 会影响产品可信度，不能被当作后期设置页。
   - 默认策略：系统默认使用项目方提供的 DeepSeek API。
   - 预设平台：用户填写自己的 API key，平台 base URL、协议适配与模型候选由系统维护。
   - 自定义平台：用户填写网站地址、API key 与必要模型名；系统只承诺兼容 OpenAI 风格 chat/completions 的最小协议。
   - 安全边界：用户 API key 不进入前端公开变量；若要持久化，必须走服务端加密存储与 RLS 隔离。
   - 推荐 change：`add-user-llm-provider-settings`

## P1 重要但不抢主链路

6. AI 助理分析治疗方案和血液指标
   - 价值：等结构化病历、实验室趋势与模型配置边界稳定后，再做高价值分析。
   - 推荐 change：`add-clinical-ai-analysis`

7. 加密分享 / 授权码分享
   - 价值：面向家属、医生、病友协作，但必须建立在记录质量和权限模型稳定之后。
   - 推荐 change：`add-secure-record-sharing`

8. 一页极简表格 / TimelineTable 回归主链路
   - 价值：收束产品表达，让 PRD 的“一页看懂”重新成为核心体验。
   - 推荐 change：`restore-minimal-timeline-table-view`

## P2 可做但靠后

9. 微信登录
   - 价值：真实用户测试前值得补；当前 Cloudflare Pages Functions 适配层已有预工作。

10. 手机验证码
    - 价值：中国用户友好，但需要短信服务、成本、风控与滥用防护。

11. MSD 健康查询
    - 价值：有参考意义，但属于外部内容入口，不是当前病历主骨架。

## P3 暂缓

12. 每日鼓励语、许愿墙、拥抱动画欢迎页
    - 原因：能增加温度，但当前阶段不如病历录入、趋势分析和治疗线表达重要。

13. Windows / Mac / Android / iOS / 小程序 / 鸿蒙原生版本
    - 原因：先让 Web 产品跑通真实病历场景，再扩平台。

14. OpenClaw / WebChrome 扩展集成
    - 原因：除非确定为获客或固定工作流入口，否则会分散核心架构注意力。

## 推荐执行顺序

1. `add-record-treatment-gantt-view`
2. `add-medical-document-ocr`
3. `add-lab-result-trends`
4. `add-conversational-record-editing`
5. `add-user-llm-provider-settings`

甘特图与多平台 LLM API 都属于 P0。甘特图是低成本高收益的治疗线表达能力，可以先做；多平台 LLM API 是高风险基础设施，排在第五步执行，是为了等 OCR、血液趋势与对话式修改的调用场景更清楚后，再一次性设计好 provider、密钥与自定义接口边界。
