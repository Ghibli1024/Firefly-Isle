## Why

当前 `/login` 已经把右侧身份访问面板改成夜航岛屿风格，但页面仍有一个结构性割裂：

- 左侧像临床控制台介绍区，右侧像独立移动登录页，二者只是并排放置，缺少一个共同的交互语法。
- 左侧四个能力说明以大卡片出现，视觉上更像通用 SaaS feature cards；后续背景节点也被证明会让干净海岸画面过载。
- 右侧登录卡本身适合作为身份访问真源复用，但桌面端抽屉与窄屏弹层会让同一状态分裂成两套空间规则。
- 用户最终选择的方向更接近产品级结构：默认页应是一张全屏主题背景，而不是被圆角容器框住的局部卡片；用户点击 `登录` 后，所有宽度都以同源居中弹层呈现登录卡。

这个 change 的本质不是换几张卡片，而是给 `/login` 建立一个稳定模型：

```
所有宽度 /login

┌──────────────────────────────┐
│ 全屏双主题海岸介绍页          │
│ Intro / themed coast          │
│ 登录 CTA                      │──▶ 统一登录弹层 / reusable auth card
└──────────────────────────────┘
```

## What Changes

- 将 `/login` 默认态定义为全屏双主题海岸介绍页，而不是圆角面板里的静态能力卡集合。
- 默认登录页背景只保留干净双主题海岸，不再额外渲染四个流程 waypoint 或 hover/focus 说明弹窗。
- 将登录面板定义为 CTA 驱动的统一登录弹层；桌面端与窄屏默认都不挂载表单，点击介绍页内 `登录` CTA 后再呈现同源登录卡。
- 将登录卡定义为唯一身份访问真源；所有宽度复用同一张卡、同一套关闭行为与同一份表单语义。
- 通过新生成的高清无文字双主题扁平背景、夜航/花路身份访问卡 hero、橙色 CTA、半透明控件与统一几何把介绍页与登录卡连接成同一视觉系统。
- 保持 Auth、Supabase session、匿名登录、隐私说明、主题/语言切换的业务语义不变。

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `app-shell`: `/login` 从静态双栏入口变成“全屏介绍页 + CTA 统一登录弹层”的入口结构。
- `theme-system`: `/login` 使用双主题干净背景、橙色 CTA 和统一几何收敛左右割裂；登录卡作为所有宽度共享的同一视觉资产。
- `auth`: 认证方式不变，但邮箱登录、匿名会话与社交登录入口需要在新的弹层结构中保持同等可达。

## Impact

- Affected code later: `src/components/login-page-view.tsx`, login-related tests, possibly shared login subcomponents if extraction improves reuse.
- Affected docs later: `src/components/CLAUDE.md`, `openspec/specs/app-shell/spec.md`, `openspec/specs/theme-system/spec.md`, and any design-system entrypoint that describes `/login`.
- No database, Supabase Auth, RLS, LLM, patient record, extraction, export, or route path changes are expected.
