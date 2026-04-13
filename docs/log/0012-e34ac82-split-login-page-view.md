# e34ac82 refactor: split login page view from auth container

## 1. 基本信息
- Commit: `e34ac82`
- Message: `refactor: split login page view from auth container`
- 时间顺序: 0012
- 日期: 2026-04-11
- 在当前仓库中的定位: Commit 4 之后的结构性坏味道修复提交

## 2. 这次提交实际解决了什么
- 把过胖的 `src/routes/login-page.tsx` 拆成“路由容器 + 纯展示层”两部分。
- 新增 `src/components/login-page-view.tsx` 承接 dark/light 大段设计复刻 markup，让 route 只保留认证状态和 handler。
- 这是一次结构重构，不改变登录/注册/匿名进入行为。

## 3. 是怎么一步一步完成的
1. 先读 `src/routes/login-page.tsx` 的真实代码，确认坏味道不是“函数太长”这么简单，而是路由把认证状态机、主题切换和大段 dark/light 复刻 markup 混在了一起。
2. 把纯展示层整体抽到 `src/components/login-page-view.tsx`，并把 `AuthMode`、`AuthFeedback` 这类更贴近视图的类型一起迁过去，避免 route 继续膨胀。
3. 把 `src/routes/login-page.tsx` 收缩成薄容器，只保留：
   - email / password state
   - 登录 / 注册 submit handler
   - 匿名进入 handler
   - 主题切换接线
4. 同步 `src/components/CLAUDE.md` 与 `src/routes/CLAUDE.md`，确保“组件负责展示、route 负责接线”的边界在文档层也成立。
5. 提交前刻意收窄范围，只允许 4 个目标文件进入 staged 区，不把 `docs`、`.temp` 或别的噪音混进这次 refactor。
6. 证据能明确确认的本地收口命令：
   - `npm run lint`
   - `npm run build`
   - `git diff --cached --stat`
   - `git status --short`
7. 未证实命令：虽然可以确定这次重构经历了多轮文件阅读与范围控制，但没有完整保留所有中间 grep/read/shell 细节，因此不额外补写猜测命令。

## 4. 遇到的问题
- 用户明确指出“解决坏味道”，目标不是继续实现 5.x，而是先把登录路由的职责分离做好。
- 这次重构还伴随一个强约束：必须做成单独 commit，且不能把 `CLAUDE.md`、`docs/handbooks/**`、`supabase/.temp/**` 等无关变化混进来。

## 5. 证据
- `git show --stat e34ac82`: 主要涉及 `src/components/login-page-view.tsx`、`src/routes/login-page.tsx` 与两个 L2 文档
- 计划文件与后续提交记录都明确把这次 refactor 当成独立收口单位
- 本地验证要求包括 `npm run lint`、`npm run build` 和 staged diff 范围检查

## 6. 我的判断
- 这是一个非常干净的“先止坏味道，再继续功能开发”提交。
- 它也证明了用户更在意职责边界和提交粒度，而不是盲目追求功能前进速度。

## 7. 置信度
- 当前等级: 高
- 原因: 有明确用户指令、计划文件、验证要求和最终提交记录可交叉印证。
