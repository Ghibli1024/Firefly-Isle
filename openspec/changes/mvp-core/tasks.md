## Commit cadence

- 提交粒度默认跟随当前 change 的阶段性 Step 边界。
- 若当前 change 明确提供 recommended commit map，则以该 map 为准。
- tasks 列表用于执行拆解，不等于每条 task 必须单独提交。
- 不要把一个完整工作单元拆成很多零碎 commit，也不要把多个已完成工作单元混成一个 commit。
- 每个 commit 进入 git history 前，先验证该 commit 覆盖范围内的测试通过。
- apply 执行节奏：前半段骨架与边界收口优先由主 agent 主导；后半段在边界稳定后允许受控并行，但最终整合与提交判断仍由主 agent 负责。

## Recommended commit map

- `0.1` + `0.2` + `0.3`：约束确认与文档入口确认任务，通常不单独产生代码 commit；若仅修改规划文档，可与相邻文档提交合并。
- Commit 1：`1.1` + `1.2` + `1.3` + `1.4` + `1.5` + `1.6` + `1.7` + `1.8` + `1.9` — 初始化前端脚手架、样式体系、页面骨架与 README 开发启动说明
- Commit 2：`2.1` + `2.2` — 定义患者记录模型与分型判定
- Commit 3：`3.1` + `3.2` + `3.3` + `3.4` + `3.5` + `3.6` + `3.7` — 建立患者与治疗线数据库结构、RLS、APAC region 记录与 Storage 基础设施边界
- Commit 4：`4.1` + `4.2` + `4.3` + `4.4` + `4.5` + `4.6` — 实现登录注册匿名进入、会话持久化、隐私门控与登出流程
- Commit 5：`5.1` + `5.2` + `5.3` + `5.4` + `5.5` + `5.6` + `5.7` + `5.8` + `5.9` — 实现 Gemini LLM 代理、具名错误处理、前端调用封装与 README 接入说明
- Commit 6：`6.1` + `6.2` + `6.3` + `6.4` + `6.5` + `6.6` + `6.7` + `6.8` — 实现信息提取主链路、类型归一化、追问合并、错误恢复与 README 功能说明同步
- Commit 7：`7.1` + `7.2` + `7.3` + `7.4` + `7.5` — 实现治疗时间线表格、初发区块显示规则与关键缺失字段提示
- Commit 8：`8.1` + `8.2` + `8.3` — 补齐行内编辑的 focus、保存归一化与布局稳定性
- Commit 9：`9.1` + `9.2` + `9.3` + `9.4` — 实现时间线 PDF / PNG 导出、命名约定与成功/失败反馈
- Commit 10：`10.1` + `10.2` + `10.3` + `10.4` + `10.5` + `10.6` + `10.7` + `10.8` + `10.9` — 收口 MVP 集成验证、文档同步与最终 README 审核
- Commit 11：`11.1` + `11.2` + `11.3` + `11.4` + `11.5` — 配置 GitHub Actions、Cloudflare Pages、隐私条款页面与上线前验证

## 0. Stitch 约束确认

- [x] 0.1 读取 `docs/products/stitch-screen-mapping.md`，确认 MVP 仅参考 6 个 Web 原型（登录页面 / 临床工作区 / 档案详情 × Dark / Light），不参考 Mobile 页面
- [x] 0.2 以 `screenInstances.label` 作为页面名称真相源；需要页面结构细节时，通过 `sourceScreen -> get_screen(...)` 读取底层资源，不使用 `project.title` 或 `list_screens.title`
- [x] 0.3 在开始实现前，确认当前 change 涉及的根 / 模块 / 文件级文档入口（L1 / L2 / L3）已知，避免孤立代码变更

## 1. 项目脚手架

- [x] 1.1 用 `npm create vite@latest` 初始化 React + TypeScript 项目，删除模板样板文件
- [x] 1.2 安装并配置 Tailwind CSS v4
- [x] 1.3 安装 shadcn/ui，运行 `npx shadcn@latest init`，配置主题并建立 Dark / Light 切换基础与本地持久化恢复
- [x] 1.4 安装 React Router v6，配置基础路由结构（/login, /app, /record/:id）
- [x] 1.5 搭建应用壳层（登录页 / 临床工作区 / 档案详情的基础布局骨架），并将主题切换入口放在壳层级共享结构中，而不是页面局部实现
- [x] 1.6 基于 `docs/products/stitch-screen-mapping.md`、`docs/design/dark/` 与 `docs/design/light/` 的真相源，完整复刻 6 个 Web 页面对应的 3 套页面结构与 1 套共享主题 token；当前实现若仅完成工程骨架或近似布局，不得视为完成
- [x] 1.6a 逐页消费 `docs/design/dark/_1~_3/code.html` 与 `docs/design/light/_1~_3/code.html`，建立登录页 / 临床工作区 / 档案详情在 Dark / Light 下的结构对照矩阵
- [x] 1.6b 对齐三类页面的分栏比例、导航位置、标题层级、主要信息块位置、关键装饰规则与交互入口，确保 React 实现视觉结果与设计稿一致
- [x] 1.6c 对齐 Dark / Light 共用与差异化 token：颜色、字体、边框、圆角、阴影/无阴影策略、间距节奏、主题切换表现
- [x] 1.6d 以 screenshot / HTML 为依据完成一次人工复核，确认当前实现达到“完全复刻设计稿”而不是“工程近似”
- [x] 1.7 安装 Supabase JS 客户端（`@supabase/supabase-js`），创建 `src/lib/supabase.ts` 初始化客户端
- [x] 1.8 配置 `.env.local`（VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_SUPABASE_EDGE_FUNCTION_URL）
- [x] 1.9 当脚手架与本地运行链路首次可用后，更新 README 中的开发启动说明（安装、运行、环境变量）

## 2. 数据模型

- [x] 2.1 在 `src/types/patient.ts` 定义 `PatientRecord` 和 `TreatmentLine` TypeScript interface
- [x] 2.2 创建 archetype 检测工具函数 `getPatientArchetype(record: PatientRecord)` → `'non-advanced' | 'de-novo-advanced' | 'relapsed-advanced'`

## 3. Supabase 数据库

- [x] 3.1 编写 `supabase/migrations/001_init.sql`：创建 `patients` 表（id, user_id, basic_info, initial_onset, created_at, updated_at）和 `treatment_lines` 表（patient_id, line_number, regimen 等）
- [x] 3.2 为 `patients` 和 `treatment_lines` 启用 RLS，确保 authenticated 和 anon 用户只能访问 `user_id = auth.uid()` 的数据
- [x] 3.3 编写 `BEFORE UPDATE` trigger 自动设置 `patients.updated_at = now()`
- [x] 3.4 在 Supabase Dashboard 执行 migration SQL，验证表结构、RLS 和级联删除生效
- [x] 3.5 确认 Supabase 项目最终 region 从可用 APAC 节点中基于中国大陆链路测试选定，并将节点标识记录到项目配置文档中
- [x] 3.6 创建 Supabase Storage bucket（如 `patient-assets`），作为患者相关资源的基础设施边界，不要求在当前 MVP 暴露图片/OCR 上传主流程
- [x] 3.7 为 Storage bucket 配置按 user_id / 匿名 uid 隔离的访问策略，并验证不同用户与匿名用户不可访问彼此资源

## 4. 认证

- [x] 4.1 创建隐私政策门控组件 `PrivacyGate`：首次启动检查 localStorage `privacy_accepted` flag，未接受则显示全屏弹窗并阻塞导航；拒绝或关闭时仍停留在门控状态
- [x] 4.2 创建登录页 `/login`：邮箱 + 密码表单，调用 `supabase.auth.signInWithPassword()`，失败显示通用错误（不泄露具体原因）
- [x] 4.3 创建注册流程：`supabase.auth.signUp()`，成功后显示「请查收验证邮件」提示
- [x] 4.4 添加匿名登录按钮：`supabase.auth.signInAnonymously()`，成功后进入主应用
- [x] 4.5 在 App 根组件实现 session 持久化：`supabase.auth.getSession()` + `onAuthStateChange` 监听，session 有效则跳过登录页
- [x] 4.6 实现登出：`supabase.auth.signOut()` + 清空本地状态 + 跳转 `/login`

## 5. LLM Adapter（Edge Function）

- [x] 5.1 在 `supabase/functions/llm-proxy/index.ts` 创建 Edge Function：验证 JWT，接收 `messages` 与可选 `model` 参数，转发到 Gemini API
- [x] 5.2 使用 fetch 调用 Gemini API，读取 `GEMINI_API_KEY`，默认模型为 `gemini-2.5-flash`
- [x] 5.3 统一 Edge Function 响应格式：成功时返回文本内容，失败时返回具名可识别错误（如 `LLMTimeoutError`、`LLMRateLimitError`、`LLMInvalidResponseError`）
- [x] 5.4 对无效 JWT、超过 30 秒的超时和 429 限流实现明确错误处理，不在前端暴露任何 API Key
- [x] 5.5 在 Supabase Dashboard 配置 `GEMINI_API_KEY` secret 和默认模型环境变量
- [x] 5.6 部署 Edge Function：`supabase functions deploy llm-proxy`
- [x] 5.7 创建前端封装 `src/lib/llm/`：`chat(messages: Message[], options?: ChatOptions) → Promise<string>`
- [x] 5.8 前端默认使用 Gemini 模型，允许通过 `options.model` 覆盖具体 Gemini 模型名
- [x] 5.9 当外部依赖或接入方式发生变化后，更新 README 中的接入与配置说明

## 6. 信息提取

- [x] 6.1 编写提取 prompt 模板（`src/lib/extractionPrompt.ts`）：含完整 `PatientRecord` TypeScript interface 作为 schema 约束，要求输出纯 JSON
- [x] 6.2 实现 `extractPatientRecord(input: string): Promise<PatientRecord>`：调用 llmAdapter → strip markdown fences → JSON.parse → 产出可进入追问与渲染流程的 `PatientRecord`
- [x] 6.3 对 age、height、weight、lineNumber 等数值字段做类型归一化，并对 diagnosisDate、startDate、endDate、triggerDate 做日期格式归一化（YYYY-MM-DD 或 YYYY-MM）
- [x] 6.4 实现关键字段缺失检测：`getMissingCriticalFields(record: PatientRecord) → string[]`（关键字段：tumorType, stage, regimen）
- [x] 6.5 实现追问循环：最多 3 轮；关键字段补全后提前终止；第 3 轮后即使仍不完整也返回当前结果；同轮缺失字段必须合并为一次追问
- [x] 6.6 定义追问补充结果与现有 `PatientRecord` 的 merge 规则，明确 treatmentLines 与字段冲突时的合并策略
- [x] 6.7 JSON 解析失败时显示用户友好错误提示 + 提供重试按钮
- [x] 6.8 当核心主流程、MVP 能力边界或项目当前阶段状态发生可感知变化后，更新 README 中的功能说明与项目状态

## 7. 时间线表格渲染

- [x] 7.1 创建 `TimelineTable` 组件，接收 `PatientRecord` prop，根据 archetype 渲染对应布局
- [x] 7.2 实现 `BasicInfoBlock`：渲染性别、年龄、身高/体重、肿瘤类型、诊断日期、分期
- [x] 7.3 实现 `InitialOnsetBlock`：在 `initialOnset` 存在时渲染初发时间、治疗方案、免疫组化、基因检测；适用于 non-advanced 与 relapsed-advanced 场景
- [x] 7.4 实现 `TreatmentLineBlock`：循环渲染每条治疗线（线号、方案、起止日期、活检、免疫组化、基因检测）
- [x] 7.5 仅对临床关键缺失字段（`tumorType`、`stage`、`regimen`）应用明显高亮；非关键空字段保持留白，不渲染 `undefined`、`null` 或统一 `?` 占位符

## 8. 表格编辑

- [ ] 8.1 为每个表格字段添加点击编辑能力（inline edit）：点击字段 → 变为 input/textarea → 自动 focus
- [ ] 8.2 编辑确认后更新本地 `PatientRecord` state，并按字段归属同步更新 `patients` 或对应的 `treatment_lines` 记录；空字符串保存为 `undefined`
- [ ] 8.3 确保编辑模式下 input/textarea 不导致表格布局明显跳变，行高/列宽误差控制在可接受范围内

## 9. 导出

- [ ] 9.1 安装 `html2canvas` 和 `jspdf`
- [ ] 9.2 实现 PDF 导出：截取 `TimelineTable` DOM → html2canvas（scale=2）→ jsPDF 生成 A4 PDF → 触发下载，文件名为 `firefly-{YYYY-MM-DD}.pdf`
- [ ] 9.3 实现 PNG 导出：同上流程，跳过 jsPDF，直接 `canvas.toBlob()` → 触发下载，文件名为 `firefly-{YYYY-MM-DD}.png`
- [ ] 9.4 导出期间显示 loading 状态，完成后恢复交互；失败时显示用户可读错误，并输出完整控制台错误信息

## 10. 集成验证

- [ ] 10.1 端到端流程测试：文字输入 → 提取 → 追问 → 渲染 → 编辑 → PDF 导出
- [ ] 10.2 验证 RLS：用两个不同账户登录，确认数据隔离
- [ ] 10.3 验证匿名模式：匿名登录 → 创建记录 → 刷新页面 → session 恢复 → 记录仍在
- [ ] 10.4 验证隐私政策门控：清除 localStorage → 刷新 → 弹窗出现；未确认前无法进入主功能；确认后正常使用
- [ ] 10.5 验证主题系统：首次进入默认 Dark → 手动切换到 Light → 刷新后恢复上次选择
- [ ] 10.6 验证导出文件命名、内容完整性与失败提示符合 spec 约定
- [ ] 10.7 若本轮涉及架构级变化，更新受影响的 L1 / L2 / L3 文档并验证其与代码现实一致
- [ ] 10.8 对照对应 phase exit criteria 进行收口，确认该阶段产物已经达到进入下一阶段的标准
- [ ] 10.9 在阶段收口或准备提交里程碑 commit 前，检查 README 是否会误导新协作者；若会，则在当前变更内一并修正

## 11. 部署

- [ ] 11.1 配置 GitHub Actions 工作流，覆盖当前 MVP 所需的 lint / type-check / test / deploy 链路
- [ ] 11.2 配置 Cloudflare Pages 部署链路，确保当前前端可完成基础构建与发布
- [ ] 11.3 准备基础隐私条款页面，并确认上线前可从产品入口访问，且与应用内隐私门控文案保持一致来源
- [ ] 11.4 验证导出功能在目标浏览器中的表现，确认 PDF / PNG 导出满足 MVP 可用性
- [ ] 11.5 对 Supabase RLS、Storage 访问策略与部署后的核心链路做上线前安全与可用性复核
