# integrate-deepseek-api/
> L2 | 父级: /CLAUDE.md

成员清单
CLAUDE.md: archived change 局部地图，说明 DeepSeek API 接入 artifacts 与职责边界，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
proposal.md: 说明为什么将 LLM 代理从 Gemini-only 扩展到 DeepSeek 服务端通道，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
design.md: 记录 provider adapter 表、DeepSeek OpenAI 格式请求、JSON 输出、错误映射、配置与回滚策略，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
tasks.md: 执行清单，按上下文确认、测试先行、Edge Function adapter、前端协议、文档同步和验证拆分，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
specs/: llm-adapter delta spec，约束 provider 切换、DeepSeek JSON 输出、安全代理与错误协议，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
.openspec.yaml: OpenSpec schema 元数据，声明本 change 使用 spec-driven workflow，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 前端只知道 chat；模型密钥只在服务端；provider 差异必须被 adapter 吞掉。
