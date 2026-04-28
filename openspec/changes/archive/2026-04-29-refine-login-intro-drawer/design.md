## Context

用户从当前 `/login` 截图中指出“割裂”：左侧临床控制台和右侧夜航登录卡各自成立，但像两个产品拼在一起。后续设计探索确认了一个更强的结构方向：

- 默认页不是普通说明区，而是贴满浏览器的双主题扁平海岸介绍页：暗色为无灯塔蓝眼泪夜海与萤火虫光点，亮色为平潭风车白昼海岸。
- 右侧不再是常驻第二列或桌面专用抽屉；点击左侧 CTA 后，所有宽度都打开同一个居中登录弹层。
- 登录卡天然适合作为身份访问卡复用，桌面端和窄屏应复用同一个卡片语法与同一种弹出方式。
- 四个流程词不再放入背景空间；默认页应保持干净海岸画面，只让品牌、主标题和登录 CTA 承担信息层级。

## Decisions

### 1. `/login` 使用 intro page + unified auth overlay 模型

- **Decision**: `/login` 的默认主结构为全屏双主题海岸项目介绍页 + CTA 触发的统一登录弹层。
- **Rationale**: 这把“了解产品”和“进入系统”分成两个状态清楚的区域，同时避免当前左右双卡片互相抢主视觉。
- **Trade-off**: 表单默认不挂载，需要处理弹层打开、关闭、Escape 与可访问性。

### 2. 登录卡是身份访问真源

- **Decision**: 统一登录弹层内部使用一张可复用登录卡；该卡片必须跟随当前主题切换材质。
- **Rationale**: 当前右侧设计已经接近完整登录页。把它抽象成真源，可以减少桌面/窄屏两套登录 UI 的漂移；亮色主题下继续显示暗色卡片会重新制造左右割裂。
- **Trade-off**: 桌面端不再占据右侧固定列，登录卡保持接近窄屏弹层的紧凑宽度。

### 2A. 身份访问卡采用灯塔路径参考结构

- **Decision**: 身份访问卡以“灯塔路径 hero + 邮箱/密码 + 记住我/忘记密码 + 社交入口 + 橙色登录 + `或` 分隔 + 匿名会话”为固定阅读顺序；登录/注册切换降级为底部细文本入口，不再占据卡片顶部。
- **Rationale**: 用户认可的参考图把身份访问表达为一条由光路引导的登录路径。表单控件应顺着这条路径从凭证输入到主动作，再到匿名备选，而不是先把社交登录或模式 tab 抢到顶部。
- **Trade-off**: 注册入口不再是首屏主视觉；它仍保留在同源卡片底部，避免破坏已有 Auth 能力。

### 3. 默认背景不再承载四个流程节点

- **Decision**: 默认 `/login` 背景只保留主题海岸、品牌、主标题、说明文案、安全状态和登录 CTA，不再渲染 `混乱 / 整理 / 结构化 / 可追溯` 四个 waypoint 或说明弹窗。
- **Rationale**: 海岸背景本身已经提供足够的方向感；额外节点会把视觉注意力从主 CTA 和身份访问卡上拉走。
- **Trade-off**: 登录页少了一层显性流程解释，产品机制说明应放回工作区或后续内容，而不是压在首屏背景上。

### 4. CTA 触发身份访问状态

- **Decision**: 左侧介绍页提供唯一明确 CTA `登录`；触发后所有宽度打开同一个统一登录弹层。
- **Rationale**: 用户先理解产品，再进入认证；同一种弹出行为让宽度变化不再改变登录心智模型。
- **Trade-off**: 桌面默认不挂载表单，牺牲一步直达效率，换来更清楚的“了解产品 -> 登录”路径。

### 5. 默认只显示主页面，登录卡统一弹出

- **Decision**: `/login` 默认只展示项目介绍页与 `登录` CTA，不再展示右侧窄身份访问抽屉；点击 CTA 后以居中弹层呈现完整登录卡。
- **Rationale**: `登录` CTA 已经完整承担入口功能，右侧窄抽屉会形成重复入口并消耗横向空间。同一张 `AuthCard` 作为所有宽度的弹层真源，避免两套登录结构漂移。
- **Trade-off**: 窄屏多一次点击进入表单，换来稳定的首屏层级和更少的响应式特殊布局。

### 6. 默认态使用全屏主题背景，不再使用 framed card

- **Decision**: 默认登录页移除外层圆角容器和面板边框，暗色使用无灯塔蓝眼泪夜海与萤火虫光点，亮色使用平潭风车白昼海岸，左侧保留品牌文案、轻量英文定位行与主 CTA，安全状态贴近 CTA 而不是悬在页面角落。
- **Rationale**: 用户最终选择的是“整屏就是背景空间”的沉浸感。继续保留面板边界会把主题背景压回局部装饰，削弱主视觉。
- **Trade-off**: 桌面默认态更像视觉产品页，需要依靠 CTA 邻近安全状态保持清楚的操作语义。

### 7. 视觉融合靠背景、材质和几何，不靠堆装饰

- **Decision**: 统一使用主题背景、半透明控件、橙色行动 CTA 和轻量安全状态；暗色身份访问卡继续使用夜航 hero，亮色身份访问卡改用白色 surface 与花路灯塔白昼 hero。
- **Rationale**: 解决割裂的关键是统一空间和信息角色，而不是把左侧也画成普通 SaaS 卡片或把右侧完全改回表单。
- **Trade-off**: 需要避免新增经纬线、数值、航线覆盖物和流程节点；背景必须保持干净。

### 8. 全屏背景必须使用高清双主题生成资产

- **Decision**: 暗色 `/login` intro 使用无灯塔版本的 `public/login/blue-tears-background-dark.png`，亮色 `/login` intro 使用 `public/login/wind-field-background-light.png`；身份访问登录卡在暗色主题继续使用原 `public/login/night-island-auth-scene.png` hero，在亮色主题使用 `public/login/light-auth-flower-path.png` 作为白色卡片 hero。
- **Rationale**: 原裁切图只有 788x450，贴满浏览器后会严重发糊；重新生成 16:9 无文字、无经纬线、无数值标记的扁平背景，才能让桌面端保持可用清晰度和干净秩序。
- **Trade-off**: 新图在暗色下不替换登录卡内部 hero，以保留已确认的身份访问卡视觉；亮色身份访问卡拥有单独 hero，避免与全屏白昼 intro 共用同一张图而显得单调。

## Page Model

```
Desktop default

┌─────────────────────────────────────────────────────────────┐
│ Full-screen themed coast background                         │
│ ┌ brand ┐                                                   │
│ │ hero title + clean themed coast background                 │
│ │                                                            │
│ │ tagline + title + copy                                     │
│ │ ● CTA 登录  security status                                │
│ └────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

```
Opened overlay state

┌─────────────────────────────────────────────────────────────┐
│ Full-screen themed coast background                         │
│             ┌──────────────────────────────┐                │
│             │ Unified auth overlay/card    │                │
│             │ reusable auth                │                │
│             └──────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

```
Narrow state

┌──────────────────┐
│ Intro page first  │
│ Login CTA         │──▶ overlay Auth card
│ utility controls  │
│ system status     │
└──────────────────┘
```

## UI Design Prompt

Use this prompt with the `ui-design` skill / built-in image generation when another visual iteration is needed:

> Two crisp high-resolution 16:9 flat editorial web backgrounds for a Chinese clinical AI login page. Dark theme: abstract Pingtan blue-tears night sea, deep navy negative space on the left, luminous blue shoreline on the right, subtle warm firefly dots near foreground rocks, clean vector-like coastal forms, no lighthouse, no tower, no building, no map lines. Light theme: abstract Pingtan wind-turbine coast in daylight, white and pale blue negative space on the left, quiet sea and cliffs on the right, clean vector-like shapes, no latitude/longitude, no degrees, no route lines, no text, no UI, no people, no logo, no watermark, sharp and not blurry.

## Open Questions

- 社交登录当前 disabled；视觉上继续展示为暖灰次级入口，后续是否接入真实 OAuth 另开 auth change。
