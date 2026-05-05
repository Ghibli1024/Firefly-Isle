<!--
 * [INPUT]: 依赖 docs/products/archive/prd.md、src/、supabase/、functions/ 与 public/ 的当前实现事实。
 * [OUTPUT]: 对外提供 PRD 功能的已实现、部分实现、未实现与额外能力盘点。
 * [POS]: docs/products 的当前产品状态真相源，连接历史 PRD 快照与运行时代码现实。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 -->

# PRD 实现状态盘点

## 用户问题

> 比对我里面的 PRD 查看我现在有哪些功能已实现，哪些功能未实现。

## 盘点基准

- PRD 快照：`docs/products/archive/prd.md`
- 实现核对范围：`src/`、`supabase/`、`functions/`、`public/`
- 验证命令：`npm run test`
- 最近核对结论：P0 主链路基本已实现；P1 基本未实现；P2 只实现了中英双语和背景音乐的变体。

## 已实现

- 自然语言病史输入到 LLM 结构化提取：已实现，走 `chat()` -> `llm-proxy` -> Gemini / DeepSeek。
- `PatientRecord` 数据模型：已覆盖基本信息、初发区块、多线治疗、免疫组化、基因检测。
- 最多 3 轮追问：已实现。
- 缺失关键字段高亮：已实现。
- 手动编辑表格/预览字段并落库：已实现。
- Supabase 持久化、RLS 用户隔离、最近记录恢复：已实现。
- `/record/:id` 读取真实病历并支持 PDF / PNG 导出：已实现。
- 中英双语：已实现。
- 背景音乐：已实现本地歌单控件，但不是 PRD 写的《Just One Dance》。

## 部分实现 / 有偏差

- 一页极简表格：数据和渲染能力有，但当前主界面更像 V3 病历预览/正式档案，不是纯 PRD 描述的一页极简表格；`TimelineTable` 组件存在但当前路由没直接挂载。
- 输入框中对话式修改：追问补全可合并到病历，但还不是完整的自由对话修改器。
- 微信登录：Cloudflare Pages Functions 适配层已写，前端仍显示“敬请期待”。
- 手机验证码：只有占位，未接短信服务。
- 上传/语音入口：按钮有反馈“暂未开放”，没有真实文件上传、OCR、录音逻辑。

## 未实现

- 血常规、血生化、肿瘤标志物 AI 识别。
- 血液指标趋势表格、异常持续增高高亮。
- 拍照上传纸质病历并自动识别。
- 加密分享 / 授权码分享。
- MSD 健康查询。
- AI 助理分析治疗方案和血液指标。
- Windows / Mac / Android / iOS / 小程序 / 鸿蒙原生或全平台版本。
- OpenClaw / WebChrome 扩展集成。
- 许愿墙。
- 每日鼓励语。
- PRD 描述的“拥抱动画 + 鼓励语欢迎页”。

## 额外已做但 PRD 未明确列出

- 邮箱登录、注册、重置密码、匿名登录、Google 登录。
- 隐私门控和 `/privacy` 页面。
- LLM proxy 的 JWT 校验和匿名/登录用户频率限制。
- GitHub Actions + Cloudflare Pages 部署基线。
- 自动测试覆盖：17 个测试文件、126 个测试通过。

## 关键实现入口

- `src/lib/extraction.ts`
- `src/lib/extractionPrompt.ts`
- `src/routes/workspace-page.tsx`
- `src/routes/record-page.tsx`
- `src/lib/export-record.ts`
- `supabase/migrations/001_init.sql`
- `supabase/functions/llm-proxy/handler.ts`
