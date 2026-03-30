## Context

一页萤是一个面向晚期癌症患者/家属的治疗记录生成器。患者面临多线治疗方案、信息过载、就诊时间极短的困境，需要一个工具快速生成一页纸治疗时间线表格递给医生。

**当前状态：** Greenfield 项目，无任何代码、无 package.json。仅有 PRD、proposal.md 和 8 个功能 spec。

**用户群体约束：** 晚期癌症患者/家属，情感极度脆弱，UI 必须简洁、无干扰、可信赖。错误提示需温和，绝不暴露技术细节。

**核心约束：** MVP 要快、稳、简单。不为假想的 P2 需求设计抽象层。

## Goals / Non-Goals

**Goals:**
- 自然语言输入 → 结构化 `PatientRecord` 提取（Claude API，max 3 轮追问）
- 治疗时间线表格渲染（支持非晚期、确诊即晚期、复发晚期三种 archetype）
- 表格字段内联编辑 + 空字段高亮提示
- PDF + PNG 导出（纯前端，html2canvas + jsPDF）
- Supabase 云端存储（patients + treatment_lines 表，RLS 行级安全）
- 用户认证：邮箱登录 + 匿名模式
- 隐私政策门控（首次启动弹窗，localStorage flag，阻塞主功能）

**Non-Goals:**
- 手机端 / 微信小程序（P2 路线图，不在 MVP 内）
- 多语言支持
- 手写体 OCR（仅支持打印体，Claude Vision / 通义千问 VL）
- LLM Adapter 用户可配置界面（P2，MVP 硬编码 Claude API）
- 离线模式
- 团队协作 / 多用户共享记录

## Decisions

### 1. 前端框架：Vite + React 18 + TypeScript

**选择理由：** 无 SSR 需求（纯 SPA，数据来自 Supabase 客户端），Vite 构建更快，热更新体验优于 CRA。TypeScript 在数据模型（PatientRecord 接口）上提供类型安全保障。

**对比 Next.js：** Next.js 的 SSR/ISR 对本项目无价值，反而引入了服务端部署复杂度。Cloudflare Pages 部署静态 SPA 比 Next.js 更简单。

### 2. CSS 方案：Tailwind CSS v4 + shadcn/ui

**选择理由：** shadcn/ui 组件无运行时依赖，直接复制到项目中可完全掌控样式，适合高度定制的医疗场景 UI。Tailwind v4 性能更好，JIT 模式默认开启。

**对比 MUI：** MUI 组件库体积大，覆盖样式成本高，且 Material Design 风格不适合「温暖、人性化」的医疗产品定位。

### 3. 后端：Supabase（Auth + PostgreSQL + RLS + Edge Functions）

**选择理由：** Supabase 内置 Auth、行级安全、Edge Functions，MVP 阶段零后端代码。RLS 策略确保用户只能访问自己的数据，无需在应用层写权限逻辑。

**对比自建 Express API：** 自建 API 需要额外维护认证中间件、数据库连接池、部署运维。MVP 阶段这些都是不必要的复杂度。

### 4. LLM 调用：通过 Supabase Edge Function 代理

**选择理由：** Claude API Key 不能暴露在前端代码中。Edge Function 作为轻量代理层，验证 Supabase JWT 后转发请求，同时隐藏 API Key。

**对比直接前端调用：** 直接在前端调用 Claude API 会暴露 API Key（可被 DevTools 提取），安全风险不可接受。

**对比独立后端服务：** Edge Function 与 Supabase Auth 天然集成，无需额外部署，延迟也更低（与数据库同区域）。

### 5. LLM 配置：硬编码 Claude API，不抽象 Adapter

**选择理由：** MVP 只需要 Claude API，Adapter 抽象是为不存在的需求设计的。等 P2 真的需要切换模型时再重构，避免过度工程。

**原 spec 中的「LLM Adapter 接口，用户可配置」已修正为 MVP 硬编码。**

### 6. PDF 导出：html2canvas + jsPDF（纯前端）

**选择理由：** 无需服务端渲染，零部署成本，对 MVP 场景（单次导出，无批量需求）足够。

**对比 Puppeteer/Playwright 服务端截图：** 需要额外服务器，增加运维复杂度。MVP 不值得。

**已知局限：** html2canvas 对复杂 CSS（如渐变、shadow）渲染精度有限。解决方案：导出专用样式表，避免复杂 CSS，固定 scale=2 保证清晰度。

### 7. 部署：Cloudflare Pages + GitHub Actions

**选择理由：** Cloudflare CDN 节点覆盖中国大陆周边（香港、东京），延迟低于 Vercel。静态 SPA 部署到 Cloudflare Pages 成本极低（免费套餐足够 MVP）。

**对比 Vercel：** Vercel 在中国大陆访问速度不稳定，对目标用户群体不友好。

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| LLM 提取准确率不稳定，关键字段缺失 | 追问机制（max 3轮）+ 空字段高亮（黄色背景）让用户手动补全 |
| Supabase Edge Function 冷启动延迟（~500ms） | 接受。MVP 场景频率低，非实时交互场景；可加 loading 状态提示 |
| html2canvas 渲染与屏幕显示差异 | 导出专用样式表 + 固定 scale=2 + 测试主流分辨率（1080p/2K） |
| 匿名用户数据丢失（浏览器清除 cookie） | UI 明确提示「匿名模式数据绑定本设备，清除浏览器数据将丢失」|
| Claude API 费用 | MVP 单用户低频使用，成本可接受；可加速率限制（Edge Function 层） |
| Tailwind v4 生态尚不成熟（beta 期间） | 锁定版本，不追 breaking change；shadcn/ui 已支持 v4 |

## Open Questions

1. **Supabase 项目 region**：spec 建议 `ap-southeast-1`（新加坡），需用户确认是否已创建项目。
2. **隐私政策文本**：MVP 用占位符，正式上线前需法务审核。
3. **OCR 入口**：spec 提到 Claude Vision / 通义千问 VL，但 MVP 是否包含图片上传入口？当前 specs 未明确，建议 MVP 先只支持文字输入，OCR 作为 P1。
