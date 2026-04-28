## Why

当前 `/login` 已经把右侧身份访问面板改成夜航岛屿风格，但页面仍有一个结构性割裂：

- 左侧像临床控制台介绍区，右侧像独立移动登录页，二者只是并排放置，缺少一个共同的交互语法。
- 左侧四个能力说明以大卡片出现，视觉上更像通用 SaaS feature cards，不像夜航/灯塔主题里的系统路径。
- 右侧登录卡本身适合作为移动端登录页复用，但桌面端还没有把它表达为“可弹出的身份访问抽屉”。
- 用户提出的方向更接近产品级结构：左侧成为可滚动项目介绍页；用户点击入口动作后，右侧登录卡向右弹出，左侧让出位置；同一登录卡在移动端直接复用。

这个 change 的本质不是换几张卡片，而是给 `/login` 建立一个稳定模型：

```
桌面 /login

┌──────────────────────────────┐      ┌────────────────┐
│ 可滚动项目介绍页              │─────▶│ 登录抽屉 / 卡片 │
│ Intro / product narrative     │ 光路 │ reusable mobile │
└──────────────────────────────┘      └────────────────┘

移动 /login

┌────────────────┐
│ 登录卡片        │
│ same component │
└────────────────┘
```

## What Changes

- 将 `/login` 的左侧区域定义为可滚动项目介绍页，而不是静态能力卡集合。
- 将四个能力说明从大卡片改为“航标节点”能力带：`01 结构化提取 → 02 时间线推理 → 03 临床数据保护 → 04 可审计追溯`。
- 将右侧登录面板定义为可展开/收起的身份访问抽屉；桌面端默认可展示收起或展开状态，点击介绍页内 CTA 后进入展开态。
- 将登录抽屉内的登录卡定义为移动端 `/login` 的可复用登录界面。
- 通过橙色光路、统一边框、统一圆角、统一暗色材质把左侧介绍页与右侧登录卡连接成同一视觉系统。
- 保持 Auth、Supabase session、匿名登录、隐私说明、主题/语言切换的业务语义不变。

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `app-shell`: `/login` 从静态双栏入口变成“可滚动介绍页 + 可展开登录抽屉”的入口结构。
- `theme-system`: `/login` 使用航标节点、橙色光路和统一暗色材质收敛左右割裂；右侧登录卡作为桌面抽屉与移动端入口的同一视觉资产。
- `auth`: 认证方式不变，但邮箱登录、匿名会话与社交登录入口需要在新的抽屉结构中保持同等可达。

## Impact

- Affected code later: `src/components/login-page-view.tsx`, login-related tests, possibly shared login subcomponents if extraction improves reuse.
- Affected docs later: `src/components/CLAUDE.md`, `openspec/specs/app-shell/spec.md`, `openspec/specs/theme-system/spec.md`, and any design-system entrypoint that describes `/login`.
- No database, Supabase Auth, RLS, LLM, patient record, extraction, export, or route path changes are expected.
