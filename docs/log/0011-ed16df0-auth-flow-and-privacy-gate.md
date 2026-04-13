# ed16df0 feat: add auth flow and privacy gate

## 1. 基本信息
- Commit: `ed16df0`
- Message: `feat: add auth flow and privacy gate`
- 时间顺序: 0011
- 日期: 2026-04-11
- 在当前仓库中的定位: `mvp-core` Commit 4（4.1 ~ 4.6）的核心提交

## 2. 这次提交实际解决了什么
- 把登录、注册、匿名进入、会话恢复、退出登录与首次隐私门控真正接进了应用。
- 同时建立了 `src/lib/auth.tsx` 与 `src/lib/privacy.ts` 这两个后续一直会被复用的状态/文案真相源。
- 让 `/login`、`/app`、`/record/:id` 开始拥有真实的会话语义，而不再只是壳层页面。

## 3. 是怎么一步一步完成的
1. 先读现有入口与路由装配，再决定从全局状态层下手，而不是把认证逻辑散落在页面里。
   - 先检查并修改的关键文件：
     - `src/App.tsx`
     - `src/routes/login-page.tsx`
     - `src/lib/supabase.ts`
   - 这里没有保留一条单独的固定命令来“生成” auth flow，更多是逐文件阅读后直接编辑。
2. 先把隐私门控的真相源收拢到 `src/lib/privacy.ts`，再实现全局门控层。
   - 关键实现：
     - `src/lib/privacy.ts`
     - `src/components/privacy-gate.tsx`
   - 目标是让 localStorage key、摘要文案和条目列表都有唯一来源。
3. 再建立认证状态中心，把 session 恢复、广播和退出登录放进 Context。
   - 关键实现：
     - `src/lib/auth.tsx`
   - 依赖的 Supabase API 语义：
     - `supabase.auth.getSession()`
     - `supabase.auth.onAuthStateChange(...)`
     - `supabase.auth.signOut()`
4. 修改 `src/App.tsx`，把装配顺序固定为：
   - `ThemeProvider`
   - `AuthProvider`
   - `BrowserRouter`
   - `PrivacyGate`
   - `AppRoutes`
   这样 `/login`、`/app`、`/record/:id` 才真正受认证与隐私门控控制。
5. 最后改造登录页容器，接上邮箱登录、注册、匿名进入三条主路径。
   - 关键实现：
     - `supabase.auth.signInWithPassword(...)`
     - `supabase.auth.signUp(...)`
     - `supabase.auth.signInAnonymously()`
   - 关键文件：
     - `src/routes/login-page.tsx`
6. 收口前做本地验证与文档同步。
   - 证据明确出现过的验证命令：
     - `npm run lint`
     - `npm run build`
   - 再同步：
     - `README.md`
     - `openspec/changes/mvp-core/tasks.md`
     - 多个 `CLAUDE.md`
- 已证实命令：`npm run lint`、`npm run build`。
- 未证实命令：当前没有保留下完整的终端转录来证明当时逐条执行过哪些文件生成、搜索或临时检查命令；因此除已验证项外，其余一律标记为未知。

## 4. 遇到的问题
- `src/App.tsx` 在当时并不是想象中的空壳，认证状态流和已有组件装配已经有自己的形状，不能直接按预设重写，只能先读真实文件再嫁接。
- `src/lib/supabase.ts` 最初把 Auth 与 Edge Function env 绑得太死，导致“仅测试认证主链路”也会被缺少 Edge Function URL 卡住。后来把 `hasSupabaseEnv` 与 `hasSupabaseFunctionEnv` 拆开，才让 auth 路线独立。
- 这次提交后来也成为用户坚持的“4.x 必须单独成 commit”的真相源，说明它的边界划分是重要的。

## 5. 证据
- `git show --stat ed16df0`: 核心文件是 `src/lib/auth.tsx`、`src/components/privacy-gate.tsx`、`src/lib/privacy.ts`、`src/routes/login-page.tsx`、`src/App.tsx`
- `mvp-core` 任务 4.1 ~ 4.6 与本提交范围完全对齐
- 后续会话明确把它视为 Commit 4 的完成提交

## 6. 我的判断
- 这是一笔典型的“把系统从静态页面推进到有会话的产品”的提交。
- 也是后续 llm、提取、持久化能成立的前提，因为 `/app` 从这一刻开始真正有用户上下文。

## 7. 置信度
- 当前等级: 高
- 原因: 这笔提交在后续实现、验证、拆 commit 讨论中被反复引用，具备直接会话证据、代码证据与任务映射证据。
