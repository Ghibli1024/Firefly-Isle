# b27ce69 feat: add Gemini llm proxy and adapter

## 1. 基本信息
- Commit: `b27ce69`
- Message: `feat: add Gemini llm proxy and adapter`
- 时间顺序: 0013
- 日期: 2026-04-12
- 在当前仓库中的定位: `mvp-core` Commit 5（5.1 ~ 5.9）的核心提交

## 2. 这次提交实际解决了什么
- 建立了前端到 LLM 的正式边界：浏览器只调 `chat(messages, options)`，真正的 Gemini 调用隐藏在 Supabase Edge Function `llm-proxy` 后面。
- 同时把错误协议做成具名错误类型，让上层能分辨 Auth、429、超时、非法响应等不同失败模式。
- 配套补齐了 README 与 Supabase runbook，说明 secret、部署和前端调用方式。

## 3. 是怎么一步一步完成的
1. 先在仓库里建立服务端代理入口，而不是直接从前端打 Gemini。
   - 关键文件：
     - `supabase/functions/llm-proxy/index.ts`
   - 关键实现步骤：
     - 解析 `messages` 与可选 `model`
     - 提取 `Authorization: Bearer <token>`
     - 用 Supabase JWT 验证调用者
     - 再转发到 Gemini API
2. 再把前端调用边界收敛成 `src/lib/llm/`。
   - 关键文件：
     - `src/lib/llm/types.ts`
     - `src/lib/llm/index.ts`
   - 这里把 Message、ChatOptions、ChatError 统一定型，避免后续业务层直接接触 provider 细节。
3. 处理中途暴露的类型问题。
   - 早期实现里有 `any`，不满足 lint 规则，于是补成明确的 payload 类型而不是压 lint。
4. 同步运维与接入文档，让这条能力真正可复用。
   - 关键文档：
     - `README.md`
     - `docs/operations/supabase/README.md`
5. 在真实 Supabase 项目中完成 secret 配置与函数部署。
   - 当前证据能明确确认的动作：
     - 部署 `llm-proxy`
     - 查看函数列表确认状态
   - secret 写入与 CLI 重新登录确实发生过，但完整命令串没有被可靠保留。
6. 部署失败后继续诊断，而不是跳过。
   - 真实遇到的问题：`supabase functions deploy llm-proxy` 返回 401
   - 处理方式：让用户重新登录 CLI 后再重试部署
7. 收口前做本地验证。
   - 证据明确出现过的验证命令：
     - `npm run lint`
     - `npm run build`
- 已证实命令：`supabase functions deploy llm-proxy`、`supabase functions list`、`npm run lint`、`npm run build`。
- 未证实命令：Gemini secret 的完整 `supabase secrets set ...` 参数串与重新登录 CLI 的原始命令没有被完整保留，因此不把它们写成确定事实。

## 4. 遇到的问题
- 用户曾把真实 `GEMINI_API_KEY` 贴进对话。为了避免二次暴露，我没有把 key 再写进任何工具命令，而是改成让用户自己执行 `supabase secrets set ...`，并提醒最好旋转密钥。
- `supabase functions deploy llm-proxy` 一度返回 401，问题不在代码，而在 CLI 登录态。用户重新登录后，部署才成功。
- 这次提交也提醒了一个习惯问题：不能在远端 secret/deploy 实际完成前就过早把 5.5 / 5.6 标成 done。

## 5. 证据
- `git show --stat b27ce69`: 新增 `supabase/functions/llm-proxy/index.ts`、`src/lib/llm/*`、大幅更新 runbook 与 README
- 后续验证中 `supabase functions list` 明确显示 `llm-proxy` 为 ACTIVE
- `mvp-core` 任务 5.1 ~ 5.9 与本提交形成完整对应关系

## 6. 我的判断
- 这笔提交把“AI 能力”从产品描述变成了真正可调用的基础设施边界。
- 它的重要性不只是能调 Gemini，而是把 API key、错误协议、前端调用形状一起定型。

## 7. 置信度
- 当前等级: 高
- 原因: 有直接实现、远端部署、用户操作与故障排查的完整一手记录。
