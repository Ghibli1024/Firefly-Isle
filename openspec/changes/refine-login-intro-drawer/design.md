## Context

用户从当前 `/login` 截图中指出“割裂”：左侧临床控制台和右侧夜航登录卡各自成立，但像两个产品拼在一起。后续设计探索确认了一个更强的结构方向：

- 左侧不是普通说明区，而是完整项目介绍页，可滚动浏览。
- 右侧不是普通第二列，而是身份访问抽屉；点击左侧 CTA 后向右弹出，左侧页面让出空间。
- 右侧登录卡天然适合作为移动端登录页复用，桌面端应复用同一个卡片语法。
- 四个能力项不应继续作为大卡片，而应变成连接介绍页与登录抽屉的“航标节点”路径。

## Decisions

### 1. `/login` 使用 intro page + auth drawer 模型

- **Decision**: 桌面 `/login` 的主结构为左侧可滚动项目介绍页 + 右侧可展开身份访问抽屉。
- **Rationale**: 这把“了解产品”和“进入系统”分成两个状态清楚的区域，同时避免当前左右双卡片互相抢主视觉。
- **Trade-off**: 实现比静态双栏更复杂，需要处理展开/收起状态、动画、响应式和可访问性。

### 2. 登录卡是移动端真源

- **Decision**: 右侧身份访问抽屉内部使用一张可复用登录卡；移动端 `/login` 直接使用这张卡片作为主界面。
- **Rationale**: 当前右侧设计已经接近移动端登录页。把它抽象成真源，可以减少桌面/移动两套登录 UI 的漂移。
- **Trade-off**: 桌面端抽屉布局必须尊重移动卡片尺寸，不适合在桌面端无限拉宽。

### 3. 四个能力项改成航标节点

- **Decision**: `结构化提取 / 时间线推理 / 临床数据保护 / 可审计追溯` 改为一条横向或响应式折行的航标节点能力带。
- **Rationale**: 它们不是标签页，也不是需要点击切换的大功能卡。作为“从病史到可访问系统”的路径节点，能把临床控制台与夜航灯塔主题连接起来。
- **Trade-off**: 每个能力的说明文字需要压缩，不能继续承载长段落。

### 4. CTA 触发身份访问状态

- **Decision**: 左侧介绍页提供明确 CTA，例如 `进入身份访问` / `展开登录`；触发后右侧登录抽屉进入展开态，左侧让出空间。
- **Rationale**: 用户先理解产品，再进入认证；动画让“登录卡弹出”成为空间事件，而不是突兀的第二列。
- **Trade-off**: 默认态需要谨慎选择。默认收起更戏剧化，默认展开更高效；可在实现前通过浏览器预览比较。

### 5. 视觉融合靠光路、材质和几何，不靠堆装饰

- **Decision**: 统一使用暗色临床控制室材质、细线边框、小圆角、萤火橙光路和绿色系统状态；夜航图只作为身份访问环境窗，不把右侧变成完全独立海报。
- **Rationale**: 解决割裂的关键是统一几何和信息角色，而不是把左侧也画成海岛或把右侧完全改回 SaaS 表单。
- **Trade-off**: 需要避免光路过度装饰化；光路必须连接真实结构节点和 CTA。

## Page Model

```
Desktop expanded state

┌─────────────────────────────────────────────────────────────┐
│ Intro page                                                  │
│ ┌ brand ┐                                                   │
│ │ hero title + anatomy / data map                           │
│ │                                                            │
│ │   01 ───── 02 ───── 03 ───── 04 ────────● CTA             │
│ │   提取     时间线   保护     审计          进入身份访问     │
│ │                                                            │
│ │ status rail                                                │
│ └────────────────────────────────────────────────────────────┘
│                                      light path              │
└───────────────────────────────────────────────●─────────────┘
                                                │
                                                ▼
                                      ┌──────────────────┐
                                      │ Auth drawer/card │
                                      │ mobile reusable  │
                                      └──────────────────┘
```

```
Mobile state

┌──────────────────┐
│ Auth card         │
│ hero image        │
│ social login      │
│ email/password    │
│ login/anonymous   │
└──────────────────┘
```

## UI Design Prompt

Use this prompt with the `ui-design` skill / built-in image generation when another visual iteration is needed:

> 16:9 high-fidelity Chinese web app login UI for “一页萤屿 · 临床 AI 工作台”. Design a dark clinical night-navigation interface. Desktop layout: left side is a scrollable product intro page, right side is a reusable mobile login card inside an auth drawer. The left intro page has logo, product name, large title “临床治疗时间线工作台”, subtitle “把复杂治疗史整理为可追溯的结构化病历。”, subtle anatomical line art, and a beacon-node capability rail: 01 结构化提取, 02 时间线推理, 03 临床数据保护, 04 可审计追溯. Use the rail as a glowing orange path that leads to a CTA “进入身份访问”. The CTA triggers an animated drawer concept: the right login card slides out while the left page gives space. The right card must also work as mobile login: night lighthouse hero image, title “身份访问”, social buttons 微信/谷歌, email, password, orange 登录 button, anonymous session, privacy text, theme/language controls. Make both sides feel like one product using shared thin borders, small radii, dark surfaces, orange light path, green operational state. Avoid generic SaaS cards. Chinese text must be legible, no watermark.

## Open Questions

- 默认桌面状态应为登录抽屉展开，还是收起后等待用户点击 `进入身份访问`？
- 左侧介绍页在移动端是否完全隐藏，还是在登录卡下方作为可继续阅读的介绍内容？
- 社交登录当前 disabled；视觉上是否继续展示为“即将支持”，还是先弱化到次级入口？
- 是否需要为抽屉展开动画提供 reduce-motion 版本？
