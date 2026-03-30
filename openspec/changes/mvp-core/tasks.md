## 1. 项目脚手架

- [ ] 1.1 用 `npm create vite@latest` 初始化 React + TypeScript 项目，删除模板样板文件
- [ ] 1.2 安装并配置 Tailwind CSS v4
- [ ] 1.3 安装 shadcn/ui，运行 `npx shadcn@latest init`，配置主题
- [ ] 1.4 安装 React Router v6，配置基础路由结构（/login, /app, /record/:id）
- [ ] 1.5 安装 Supabase JS 客户端（`@supabase/supabase-js`），创建 `src/lib/supabase.ts` 初始化客户端
- [ ] 1.6 配置 `.env.local`（VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_SUPABASE_EDGE_FUNCTION_URL）

## 2. 数据模型

- [ ] 2.1 在 `src/types/patient.ts` 定义 `PatientRecord` 和 `TreatmentLine` TypeScript interface
- [ ] 2.2 创建 archetype 检测工具函数 `getPatientArchetype(record: PatientRecord)` → `'non-advanced' | 'de-novo-advanced' | 'relapsed-advanced'`

## 3. Supabase 数据库

- [ ] 3.1 编写 `supabase/migrations/001_init.sql`：创建 `patients` 表（id, user_id, record_json, created_at, updated_at）
- [ ] 3.2 编写 `patients` 表的 RLS 策略：authenticated 和 anon 用户只能访问 `user_id = auth.uid()` 的行
- [ ] 3.3 编写 `BEFORE UPDATE` trigger 自动设置 `updated_at = now()`
- [ ] 3.4 在 Supabase Dashboard 执行 migration SQL，验证表和 RLS 生效

## 4. 认证

- [ ] 4.1 创建隐私政策门控组件 `PrivacyGate`：首次启动检查 localStorage `privacy_accepted` flag，未接受则显示全屏弹窗，阻塞导航
- [ ] 4.2 创建登录页 `/login`：邮箱 + 密码表单，调用 `supabase.auth.signInWithPassword()`，失败显示通用错误（不泄露具体原因）
- [ ] 4.3 创建注册流程：`supabase.auth.signUp()`，成功后显示「请查收验证邮件」提示
- [ ] 4.4 添加匿名登录按钮：`supabase.auth.signInAnonymously()`，成功后进入主应用
- [ ] 4.5 在 App 根组件实现 session 持久化：`supabase.auth.getSession()` + `onAuthStateChange` 监听，session 有效则跳过登录页
- [ ] 4.6 实现登出：`supabase.auth.signOut()` + 清空本地状态 + 跳转 `/login`

## 5. LLM Adapter（Edge Function）

- [ ] 5.1 在 `supabase/functions/llm-proxy/index.ts` 创建 Edge Function：验证 JWT → 根据 `LLM_PROVIDER` 环境变量路由请求 → 返回响应
- [ ] 5.2 实现 `qwen` handler：使用 fetch 调用通义千问 OpenAI 兼容接口（`https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`），读取 `QWEN_API_KEY`
- [ ] 5.3 实现 `openai` handler：调用 OpenAI Chat Completions API，读取 `OPENAI_API_KEY`
- [ ] 5.4 实现 `gemini` handler：将 messages 转换为 Gemini `contents` 格式，调用 Gemini API，读取 `GEMINI_API_KEY`
- [ ] 5.5 未知 provider 返回 HTTP 400 + `{"error": "unsupported provider: <value>"}`
- [ ] 5.6 在 Supabase Dashboard 配置 `QWEN_API_KEY` secret，设置 `LLM_PROVIDER=qwen`
- [ ] 5.7 部署 Edge Function：`supabase functions deploy llm-proxy`
- [ ] 5.8 创建前端封装 `src/lib/llm/`：`chat(messages: Message[], options?: ChatOptions) → Promise<string>`，默认 model 为 `qwen/qwen-vl-plus`

## 6. 信息提取

- [ ] 6.1 编写提取 prompt 模板（`src/lib/extractionPrompt.ts`）：含完整 `PatientRecord` TypeScript interface 作为 schema 约束，要求输出纯 JSON
- [ ] 6.2 实现 `extractPatientRecord(input: string): Promise<PatientRecord>`：调用 llmAdapter → strip markdown fences → JSON.parse → 验证必填字段
- [ ] 6.3 实现关键字段缺失检测：`getMissingCriticalFields(record: PatientRecord) → string[]`（关键字段：tumorType, stage, regimen）
- [ ] 6.4 实现追问循环：最多 3 轮，每轮将所有缺失字段批量组合为一条追问消息，收到回复后 merge 到现有 record
- [ ] 6.5 JSON 解析失败时显示用户友好错误提示 + 提供重试按钮

## 7. 时间线表格渲染

- [ ] 7.1 创建 `TimelineTable` 组件，接收 `PatientRecord` prop，根据 archetype 渲染对应布局
- [ ] 7.2 实现 `BasicInfoBlock`：渲染性别、年龄、身高/体重、肿瘤类型、诊断日期、分期
- [ ] 7.3 实现 `InitialOnsetBlock`：渲染初发时间、治疗方案、免疫组化、基因检测（仅 relapsed-advanced archetype 显示）
- [ ] 7.4 实现 `TreatmentLineBlock`：循环渲染每条治疗线（线号、方案、起止日期、活检、免疫组化、基因检测）
- [ ] 7.5 所有 undefined/null 字段渲染为黄色背景占位符（`?`），视觉提示用户补全

## 8. 表格编辑

- [ ] 8.1 为每个表格字段添加点击编辑能力（inline edit）：点击字段 → 变为 input/textarea → blur 或回车确认
- [ ] 8.2 编辑确认后更新本地 `PatientRecord` state，同步调用 `supabase.from('patients').update()` 持久化

## 9. 导出

- [ ] 9.1 安装 `html2canvas` 和 `jspdf`
- [ ] 9.2 实现 PDF 导出：截取 `TimelineTable` DOM → html2canvas（scale=2）→ jsPDF 生成 A4 PDF → 触发下载
- [ ] 9.3 实现 PNG 导出：同上流程，跳过 jsPDF，直接 `canvas.toBlob()` → 触发下载
- [ ] 9.4 导出期间显示 loading 状态，完成后提示成功

## 10. 集成验证

- [ ] 10.1 端到端流程测试：文字输入 → 提取 → 追问 → 渲染 → 编辑 → PDF 导出
- [ ] 10.2 验证 RLS：用两个不同账户登录，确认数据隔离
- [ ] 10.3 验证匿名模式：匿名登录 → 创建记录 → 刷新页面 → session 恢复 → 记录仍在
- [ ] 10.4 验证隐私政策门控：清除 localStorage → 刷新 → 弹窗出现 → 确认后正常使用
