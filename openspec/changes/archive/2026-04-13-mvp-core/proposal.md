## Why

晚期癌症患者/家属面临多线治疗方案、信息过载、就诊时间极短的困境，缺乏一个工具能快速生成一页纸治疗时间线表格递给医生。一页萤 MVP 解决这个核心痛点。

## What Changes

- 新建完整 Web 应用（当前仓库已建立初始 Vite 基线与产品/规格文档，但 MVP 功能仍待按 tasks 逐步实现）
- 引入自然语言 → 结构化数据提取能力（Gemini API）
- 引入治疗时间线表格渲染与导出能力
- 引入 Supabase 云端数据存储与用户认证

## Capabilities

### New Capabilities

- `patient-record`: 核心数据模型——PatientRecord（基本信息、初发区块、治疗线区块[]）
- `info-extraction`: 自然语言输入 → PatientRecord 结构化提取，含最多 3 轮追问机制
- `timeline-table`: 治疗时间线表格渲染，支持三种患者情况（非晚期、确诊即晚期、复发晚期）
- `editing`: 表格二次编辑——手动编辑字段、空白字段高亮提示（当前 MVP 不包含 AI 对话式修正）
- `export`: PDF 导出（html2canvas + jsPDF）+ PNG 图片导出
- `llm-adapter`: 统一 LLM Adapter 接口，通过 Supabase Edge Function 代理，MVP 默认接 Gemini API
- `supabase-schema`: 数据库设计——patients、treatment_lines 表，RLS 行级安全
- `asset-storage`: 资源存储基础设施——Supabase Storage bucket 与按用户隔离的访问策略
- `auth`: 用户认证——邮箱登录 + 匿名模式
- `theme-system`: 主题系统——默认 Dark、允许手动切换到 Light，并记住用户上次选择
- `app-shell`: 应用壳层——登录页面、临床工作区、档案详情三类 Web 页面结构，以及全局主题切换入口
- `deployment`: 部署链路——GitHub Actions CI/CD + Cloudflare Pages + 上线前发布检查

### Modified Capabilities

（无现有 spec，全部为新建）

## Impact

- **技术栈引入**：Vite + React 18 + TypeScript + Tailwind CSS v4 + shadcn/ui
- **外部依赖**：Supabase（Auth + PostgreSQL + Edge Functions + Storage）、Gemini API
- **部署**：Cloudflare Pages + GitHub Actions CI/CD
- **无破坏性变更**（greenfield 项目）
