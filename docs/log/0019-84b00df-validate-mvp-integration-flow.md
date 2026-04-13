# 84b00df feat: validate MVP integration flow

## 1. 基本信息
- Commit: `84b00df`
- Message: `feat: validate MVP integration flow`
- 时间顺序: 0019
- 日期: 2026-04-12
- 在当前仓库中的定位: `mvp-core` Commit 10（10.1 ~ 10.9）的收口提交

## 2. 这次提交实际解决了什么
- 完成了 10.x 集成验证的主体收口：本地浏览器验证、README 修正、Supabase runbook 更新、OpenSpec tasks 勾选同步。
- 同时修复了两个在验证中暴露出的真实问题：
  - 本地注册不应强依赖 `emailRedirectTo`
  - 导出路径里的 Tailwind 透明色会编译成 html2canvas 不支持的 `oklab(...)`

## 3. 是怎么一步一步完成的
1. 先启动本地验证环境，而不是先改代码。
   - 真实使用过的命令：
     - `npm run dev -- --host 127.0.0.1 --port 4387`
   - 然后用浏览器工具去验：
     - 隐私门控
     - 主题恢复
     - 匿名路径
     - 主链路
     - 导出
2. 在验证过程中发现匿名登录被环境挡住。
   - 真实现象：`anonymous_provider_disabled (422)`
   - 处理方式：先把 README、runbook、tasks 写清楚，承认 blocker，而不是提前把 10.x 假装完成。
3. 再发现注册流程在本地验证时被 `emailRedirectTo: window.location.origin` 绑死。
   - 具体修法：把 `src/routes/login-page.tsx` 里的显式 `emailRedirectTo` 去掉，回到默认 `signUp({ email, password })`。
4. 然后在导出验证里发现一个真正的浏览器兼容 bug。
   - 真实问题：`html2canvas` 被 dark 时间线中的透明 Tailwind 颜色打成 `oklab(...)`，最终导致导出失败
   - 具体修法：把 `src/components/timeline/TimelineTable.tsx` 里相关透明色改成稳定的 `rgba(...)`
5. 生产与本地验证通过后，把文档真相源同步回来。
   - 关键修改：
     - `README.md`
     - `docs/operations/supabase/README.md`
     - `openspec/changes/mvp-core/tasks.md`
6. 收口前反复跑过的命令：
   - `npm run build`
   - `npm run lint`
- 已证实命令：`npm run dev -- --host 127.0.0.1 --port 4387`、`npm run build`、`npm run lint`。
- 未证实命令：浏览器验证过程中还做过多轮页面操作与环境检查，但没有完整逐条 shell 记录，因此除已证实项外不额外补写。

## 4. 遇到的问题
- 匿名登录一开始被 Supabase Dashboard 配置挡住，真实错误是 `anonymous_provider_disabled (422)`；这逼着验证过程先处理环境问题。
- 导出失败不是业务逻辑错误，而是浏览器截图库与 Tailwind v4 颜色产物的兼容性问题，定位成本很高。
- 10.x 的价值并不只是“把测试跑完”，而是把验证中暴露出来的生产前问题顺手修掉。

## 5. 证据
- `git show --stat 84b00df`: 只改 `README.md`、`docs/operations/supabase/README.md`、`tasks.md`、`login-page.tsx`、`TimelineTable.tsx`
- 后续本地与生产导出验证都建立在这次修复之上
- 会话中明确把它当作 Commit 10 收口提交处理

## 6. 我的判断
- 这是一笔很典型的“验证不是附属工作，而是把系统打磨到可交付”的提交。
- 它的重要性不在于新增能力，而在于消灭那些只有真实验证才会暴露的问题。

## 7. 置信度
- 当前等级: 高
- 原因: 有完整的验证过程、故障定位、代码修复和提交边界讨论记录。
