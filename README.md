# Firefly-Isle：One-page oncology treatment timeline & record builder.
一页萤岛，晚期癌症患者治疗方案管理助手。
> Keep it running, make it helpful.

## 当前状态

- 当前仓库已完成 MVP 的 **1.x 脚手架基线**、**4.x 认证主链路**、**5.x LLM adapter 边界**、**6.x 信息提取主链路**、**7.x 时间线正式渲染**、**8.x 行内编辑与 Supabase 持久化**、**9.x PDF/PNG 导出**、**10.x 集成验证收口**、**11.x 部署链路基线**：Vite + React 18 + TypeScript、Tailwind CSS v4、shadcn/ui 初始化、React Router 四类页面骨架、Dark/Light 主题切换、隐私门控与独立隐私页、Supabase 邮箱登录 / 注册 / 匿名登录 / session 恢复 / 退出登录、Gemini Edge Function / 前端 `chat(messages, options)` 调用边界、`PatientRecord` schema prompt、JSON 解析、类型归一化、关键字段缺失检测、追问 merge、正式时间线表格、提取/追问后自动落库、刷新后恢复最近患者记录、inline edit 保存到 `patients` / `treatment_lines`、`/app` 内 PDF / PNG 导出，以及 GitHub Actions + Cloudflare Pages 部署基线。
- 当前 MVP 的实现真相源仍是 `openspec/changes/mvp-core/` 下的 `proposal.md`、`design.md`、`tasks.md` 与 `specs/`。
- 已实现路由：`/login`、`/privacy`、`/app`、`/record/:id`，并在 App 根部恢复 Supabase session。
- 已实现边界：`supabase/functions/llm-proxy/index.ts` + `src/lib/llm/`；`src/lib/extractionPrompt.ts` + `src/lib/extraction.ts`；`src/components/timeline/TimelineTable.tsx` + `src/routes/workspace-page.tsx` 的正式渲染 / 编辑 / 导出链路。
- 10.x 集成验证已完成：`10.1` 端到端主链路、`10.2` RLS 双会话隔离、`10.3` 匿名模式恢复、`10.4` 隐私门控、`10.5` 主题恢复、`10.6` PDF/PNG 导出命名与失败提示、`10.7` 文档同步、`10.8` phase exit criteria 收口、`10.9` README 复核均已完成。
- 尚未实现：11.4 / 11.5 的正式发布环境执行仍待完成，当前代码仓已具备 GitHub Actions、Cloudflare Pages、独立隐私页与发布检查清单基线。

## 开发启动

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制示例文件并填写 Supabase 项目值：

```bash
cp .env.local.example .env.local
```

需要的变量：

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_EDGE_FUNCTION_URL`

如果要跑认证主链路，还需要在 Supabase Dashboard 的 Auth Providers / URL Configuration 里确认：

- Email provider 已启用
- Anonymous Sign-In 已启用（否则“无需登录，直接使用匿名会话”会返回 422）
- 如需让验证邮件确认后回到当前本地 origin，再把该 origin 加入 Auth URL Configuration 的 Site URL / Additional Redirect URLs；当前注册流程默认不强依赖 `emailRedirectTo`

如果要跑 LLM adapter / Edge Function，还需要在 Supabase 项目里配置：

- secret：`GEMINI_API_KEY`
- function env：`DEFAULT_GEMINI_MODEL=gemini-2.5-flash`

### 3. 启动开发环境

```bash
npm run dev
```

### 4. 配置并部署 llm-proxy（5.x）

在 Supabase 项目里先配置 secret 和默认模型：

```bash
supabase secrets set GEMINI_API_KEY="<your-gemini-api-key>" DEFAULT_GEMINI_MODEL="gemini-2.5-flash"
```

然后部署函数：

```bash
supabase functions deploy llm-proxy
```

部署完成后，前端统一通过 `src/lib/llm/index.ts` 的 `chat(messages, options)` 调用该函数，不直接访问 Gemini。

### 5. 验证当前基线

```bash
npm run build
npm run lint
npm run type-check
npm run test
```

### 6. GitHub Actions + Cloudflare Pages（11.1 / 11.2）

仓库已提供 `.github/workflows/ci-cd.yml`，在 `main` push 或手动触发时执行：

- `npm run lint`
- `npm run type-check`
- `npm run test`
- `npm run build`
- 成功后发布 `dist/` 到 Cloudflare Pages

发布前需要在 GitHub 仓库配置：

- secret: `CLOUDFLARE_API_TOKEN`
- secret: `CLOUDFLARE_ACCOUNT_ID`
- variable: `CLOUDFLARE_PAGES_PROJECT_NAME`

Cloudflare Pages 侧使用当前前端默认构建：

- Build command: `npm run build`
- Build output directory: `dist`
- Node.js: `22`
- SPA fallback: `public/_redirects`
- 若 Pages 在 Git 集成构建中读取了 `wrangler.jsonc`，则当前前端依赖的 3 个 `VITE_SUPABASE_*` 值也需要同步存在于 `wrangler.jsonc > vars`，否则构建日志会显示 `Build environment variables: (none found)`，并导致线上 bundle 缺少 Supabase env。

## 项目背景 
本项目源于癌症患者及其家属的真实需求。晚期癌症患者由于频繁复发和疾病进展，往往需要经历多线治疗。在整理病历和治疗信息的过程中，患者及家属常因信息过载而感到无助；而在异地就医或门诊沟通中，由于患者数量众多，医生能够分配给单个患者的沟通时间有限，难以进行充分、系统的交流。因此，本项目旨在帮助患者更好地进行治疗方案与病历信息的管理。