# harden-auth-flow-consistency

收紧 Supabase Auth 登录、注册、匿名会话、密码重置与 Google OAuth 的 UI/状态/后端能力一致性。

阅读顺序:

1. `proposal.md` - change 动因、范围与边界
2. `design.md` - Supabase Auth 保留、假入口消失、真实入口接通的设计决策
3. `specs/auth/spec.md` - auth capability 的行为 delta
4. `tasks.md` - 测试优先的执行清单
