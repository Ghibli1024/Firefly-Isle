# Firefly-Isle：One-page oncology treatment timeline & record builder.
一页萤岛，晚期癌症患者治疗方案管理助手。
> Keep it running, make it helpful.

## 当前状态

- 当前仓库已完成 MVP 的 **1.x 脚手架基线**、**4.x 认证主链路** 与 **5.x LLM adapter 边界**：Vite + React 18 + TypeScript、Tailwind CSS v4、shadcn/ui 初始化、React Router 三类页面骨架、Dark/Light 主题切换、隐私门控、Supabase 邮箱登录 / 注册 / 匿名登录 / session 恢复 / 退出登录、Gemini Edge Function / 前端 `chat(messages, options)` 调用边界。
- 当前 MVP 的实现真相源仍是 `openspec/changes/mvp-core/` 下的 `proposal.md`、`design.md`、`tasks.md` 与 `specs/`。
- 已实现路由：`/login`、`/app`、`/record/:id`，并在 App 根部恢复 Supabase session。
- 已实现边界：`supabase/functions/llm-proxy/index.ts` + `src/lib/llm/`；完成 secret 配置与函数部署后，即可通过 Supabase Edge Function 代理 Gemini 请求。
- 尚未实现：数据库写入链路、信息提取主流程、时间线真实渲染、导出与测试收口。

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
```

## 项目背景 
本项目源于癌症患者及其家属的真实需求。晚期癌症患者由于频繁复发和疾病进展，往往需要经历多线治疗。在整理病历和治疗信息的过程中，患者及家属常因信息过载而感到无助；而在异地就医或门诊沟通中，由于患者数量众多，医生能够分配给单个患者的沟通时间有限，难以进行充分、系统的交流。因此，本项目旨在帮助患者更好地进行治疗方案与病历信息的管理。