---
version: alpha
name: 一页萤屿 V3 Clinical Archive Console
description: Firefly-Isle 双主题设计系统；工作区与病历页共享临床档案骨架，登录入口采用品牌场景 CTA + 居中认证 modal。
colors:
  accent: "#E85D2A"
  accent-strong: "#FF4A1C"
  accent-soft: "#FCE9E1"
  success: "#43A56B"
  warning: "#E85D2A"
  dark-bg: "#080A0B"
  dark-surface: "#111517"
  dark-surface-raised: "#181D20"
  dark-border: "#30363A"
  dark-text: "#F4F0E8"
  dark-muted: "#A9A39A"
  light-bg: "#F8F7F4"
  light-surface: "#FFFFFF"
  light-surface-raised: "#F1F0EC"
  light-border: "#D8D5CE"
  light-text: "#161616"
  light-muted: "#6F6B65"
  line: "#8B8B86"
  login-dark-bg: "#02080A"
  login-dark-surface: "#050B0E"
  login-light-bg: "#F7FBFB"
  login-light-text: "#172522"
  login-light-muted: "#455C58"
  login-light-border: "#CBDCDE"
typography:
  display:
    fontFamily: "var(--ff-font-display)"
    zhFontFamily: "Songti SC, STSong, New York, Times New Roman, serif"
    enFontFamily: "Fraunces, New York, Times New Roman, serif"
    fontSize: 56px
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: 0em
  title:
    fontFamily: "var(--ff-font-display)"
    zhFontFamily: "Songti SC, STSong, New York, Times New Roman, serif"
    enFontFamily: "Fraunces, New York, Times New Roman, serif"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0em
  section:
    fontFamily: "var(--ff-font-display)"
    zhFontFamily: "Songti SC, STSong, New York, Times New Roman, serif"
    enFontFamily: "Fraunces, New York, Times New Roman, serif"
    fontSize: 22px
    fontWeight: 650
    lineHeight: 1.28
    letterSpacing: 0em
  body:
    fontFamily: "var(--ff-font-ui)"
    zhFontFamily: "PingFang SC, Hiragino Sans GB, -apple-system, BlinkMacSystemFont, Helvetica Neue, sans-serif"
    enFontFamily: "Inter, -apple-system, BlinkMacSystemFont, Helvetica Neue, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: 0em
  label:
    fontFamily: "var(--ff-font-ui)"
    zhFontFamily: "PingFang SC, Hiragino Sans GB, -apple-system, BlinkMacSystemFont, Helvetica Neue, sans-serif"
    enFontFamily: "Inter, -apple-system, BlinkMacSystemFont, Helvetica Neue, sans-serif"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: 0em
  mono:
    fontFamily: "IBM Plex Mono, SFMono-Regular, SF Mono, ui-monospace, monospace"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: 0em
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  sidebar-expanded: 220px
  sidebar-min: 72px
  sidebar-max: 296px
  sidebar-label-threshold: 204px
  sidebar-collapsed: 72px
  shell-gutter: 24px
  panel-padding: 24px
  record-gutter: 32px
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  auth-field: 10px
  auth-control: 14px
  auth-modal: 28px
  full: 9999px
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#FFFFFF"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: 12px
    height: 48px
  button-secondary:
    backgroundColor: "{colors.light-surface}"
    textColor: "{colors.light-text}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: 12px
    height: 48px
    borderColor: "{colors.light-border}"
  field-focus:
    backgroundColor: "{colors.light-surface}"
    textColor: "{colors.light-text}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 16px
    borderColor: "{colors.accent}"
  status-success:
    backgroundColor: "{colors.light-surface}"
    textColor: "{colors.success}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: 8px
    borderColor: "{colors.success}"
  alert-missing:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: 12px
    borderColor: "{colors.accent}"
  sidebar-handle:
    backgroundColor: "{colors.dark-bg}"
    textColor: "{colors.accent}"
    typography: "{typography.mono}"
    rounded: "{rounded.full}"
    width: 9px
    height: 64px
    borderColor: "{colors.dark-border}"
  auth-entry-cta:
    backgroundColor: "{colors.accent}"
    textColor: "#FFFFFF"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    minHeight: 52px
  auth-modal:
    backgroundColor: "{colors.login-dark-surface}"
    textColor: "{colors.dark-text}"
    typography: "{typography.body}"
    rounded: "{rounded.auth-modal}"
    maxWidth: 568px
---

<!--
 * [INPUT]: 依赖 01-07 V3 截图、brief.md、Google DESIGN.md spec 的 frontmatter 与章节顺序，参考 Material Design 对 guidance/components/patterns 与 design tokens 的定义
 * [OUTPUT]: 对外提供一页萤屿 V3 双主题设计系统、机器可读 token 与人类可读落地规则
 * [POS]: Image-2/V3 的设计真源，被根目录 DESIGN.md 链接，被后续前端实现与图像批次复用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 -->

# 一页萤屿 V3 Design System

## Overview

V3 的北极星是 **Clinical Archive Console**：一个把复杂治疗史整理成可审计长卷的临床 AI 工作台。它不是温和 SaaS，也不是纯装饰暗黑风，而是同一套结构在两个展厅里的物质转换：

- **暗色模式**是黑色临床控制室，强调实时提取、系统状态、行动压力与荧光橙焦点。
- **亮色模式**是白色医疗档案室，强调纸面秩序、病历阅读、留痕与长期保存。
- 两个模式必须共享同一骨架：左侧默认展开导航、顶部状态条、主内容纵向流、1px 边界、8px 圆角、橙色行动线。
- 登录页是独立入口场景：首屏先呈现品牌、价值与安全状态，用户点击主 CTA 后打开居中认证 modal。它不是工作区 shell，也不使用侧栏/顶栏。

本文件来自 `docs/design/Image-2/V3/` 的截图提取。实现时以 `03-app-dark-new.png` 作为 `/app` 暗色参考，旧的 `03-app-dark.png` 仅保留生成历史；新版已经替换橙黑萤火 mark，并移除了“当前提取参数”区块，让病史输入后直接进入治疗时间线。

设计系统在本项目里的定义遵循 Google/Material 的分层思路：可复用设计决策由 guidance、components、patterns 表达；最小 primitive 是 color、type、shape，再组合成按钮、卡片、dialog、navigation 等组件。运行时代码中的 CSS custom properties 是这些 design tokens 的实现形态。

## Colors

颜色系统只允许一个真正的行动色：`accent` 橙。绿色只表示健康、完成、通过，不承担 CTA。暗亮主题不能各自发明新语汇，必须复用同一语义角色。

- **Accent `#E85D2A`:** 提取按钮、焦点边框、活动侧栏项、缺失字段、时间轴编号和关键警示。
- **Success `#43A56B`:** 系统就绪、阶段完成、AI 验证通过、档案完整。
- **Warning `#E85D2A`:** 当前实现中 warning 是 accent 的语义别名，用于缺失字段、保存失败、导出错误等需要行动的风险状态。
- **Dark neutrals:** `dark-bg` 到 `dark-surface-raised` 形成黑色控制室的层级，文字使用暖白，弱信息使用灰米色。
- **Light neutrals:** `light-bg` 到 `light-surface` 形成白色档案纸面，边界使用暖灰，正文使用近黑。
- **Line `#8B8B86`:** 时间轴、分隔线和低优先级结构线，不能抢过橙色。
- **Login scene tokens:** 登录页允许使用 `login-dark-*` / `login-light-*` 场景 token，以承接海岸/灯塔背景图的材质；它们只服务登录入口，不得扩散到 `/app`、`/record/:id` 或系统组件。

禁止把橙色扩散成背景氛围色。它只能出现在用户需要看见动作、风险或当前所在位置的地方。

## Localized Typography System

字体策略是 **Localized Typography System + Clinical UI**。中文与英文都是一等语言，不再只靠同一条 fallback 栈被动显示；`LocaleProvider` 会把当前语言同步到 `html[data-locale]`，CSS 再通过 `--ff-font-display` 与 `--ff-font-ui` 切换对应 token。英文 display/UI/mono 字体通过 `@fontsource` 的 latin 子集自托管进入前端 bundle，不新增 Google Fonts 外链。

- **Display / Title / Section:** 中文 locale 使用 `Songti SC / STSong / New York / Times New Roman`，英文 locale 使用 `Fraunces / New York / Times New Roman`。登录页、病历详情大标题、面板标题和治疗时间线标题都只消费 `--ff-font-display`。
- **Body / Label:** 中文 locale 使用 `PingFang SC / Hiragino Sans GB / Apple system`，英文 locale 使用 `Inter / Apple system / Helvetica Neue`。病历叙述、治疗说明、临床备注、按钮和表单控件都只消费 `--ff-font-ui`。
- **Medical mixed text:** 医学缩写、药名、基因突变、指标名和百分比默认仍属于正文或数据内容，例如 `HER2 1(+)`、`EGFR L858R`、`Osimertinib`、`PD-L1 TPS 45%`；不要因为它们是英文就自动改成 display 或 mono。
- **Mono:** `CLINICAL HISTORY DOSSIER`、系统版本、英文代号、日期、模型/置信度等机器感信息使用 `IBM Plex Mono / SF Mono` 栈。`@fontsource/ibm-plex-mono` 的 latin 子集已随 bundle 加载；加载失败时回退到 SF Mono / ui-monospace。

所有字号随组件层级固定，不按 viewport 宽度缩放。标题的冲击力来自版面比例和留白，不来自无限放大。

## Layout

布局遵循“可变侧栏 + 纵向病历长卷”的骨架。

- **Shell:** 左侧导航默认展开约 220px，刚好水平容纳 52px mark、水平品牌字标与短导航标签；主导航使用 50px 稳定行盒，active 态只允许细左标和低强度橙色行面，不做厚重卡片；右侧边界线中部的无文字胶囊柄负责三态点击与拖拽调整宽度，最大约 296px；拖宽到 204px 以上显示标签，回到 204px 及以下时标签文字自动隐藏，只保留 mark、图标、状态点和恢复控制；继续向左拖并越过 52px 隐藏浮标宽度后完全隐藏。隐藏后左边缘只保留一个小浮标用于点击恢复，同时支持从左边缘向右渐进拉出菜单。主内容与顶部状态条必须跟随同一个 sidebar offset。
- **Top bar:** 顶部只承载页面名、系统状态、帮助和设置，不塞入业务表单。
- **Workspace `/app`:** 病史输入在最上，导出与提取动作紧跟输入区；下方的病历预览采用 Dense Clinical Ledger：基本信息以连续 1px 台账格呈现，缺失字段只使用细橙左条、小感叹号和低强度橙底，治疗时间线保持横向病程轨，不回到厚重卡片堆叠。
- **Record `/record/:id`:** 详情页必须是可滚动长卷，顶部概要之后进入纵向治疗时间轴，右侧卡片承载免疫组化、基因检测、疗效评估。
- **Login `/login`:** 全屏品牌入口场景，首屏显示 Firefly mark、品牌名、价值陈述、安全状态和唯一“登录” CTA；认证表单不是右侧常驻栏，而是点击 CTA 后出现的居中 modal。暗亮主题共享同一信息架构和 modal 行为，只替换背景图、材料明暗与文字语气。
- **Component strip:** 组件状态必须成组出现，覆盖 active、hover、normal、disabled，避免实现时只做默认态。

不要把病历详情压缩成一屏控制台。这个产品的核心体验是“读完一份结构化病史”，滚动是信息秩序的一部分。

## Elevation & Depth

层级不靠厚阴影，靠材料差、边界和焦点线。

- **1px 边界:** 所有卡片、输入框、表格、状态芯片使用 1px 线建立结构。
- **2px 橙色焦点:** 只用于当前输入、活动导航、主要 CTA 和缺失字段。
- **Tonal layers:** 暗色用更亮一点的黑灰抬起面板；亮色用白色面板覆盖暖白页面底。
- **No heavy shadow by default:** 工作区、病历页和系统面板禁止大面积模糊投影。登录认证 modal 是 containment 层级例外，可以使用一次明确的投影和背景模糊把身份操作从入口场景中抬起，但阴影不得被复制到普通卡片。
- **Login illustration:** 登录页使用主题海岸/灯塔背景图作为第一视口信号；图像必须退后，不能压过品牌、CTA 或认证 modal。

深度的本质是“读者知道哪里可操作、哪里是证据、哪里是风险”，不是视觉炫技。

## Shapes

形状语言是工程化的温和锐利。

- 工作区、病历页、系统容器、按钮、输入框、时间线卡片默认使用 **8px** 圆角。
- 小型状态点、编号圆、勾选状态使用 `full` 圆角。
- 登录入口是独立 scene：主 CTA 可用 12px，工具胶囊和认证操作可用 14px，认证 modal 可用 28px。它们是登录组件 token，不得反向污染 clinical workspace。
- 卡片边界必须稳定，hover、focus、active 不得改变尺寸或造成布局跳动。
- 图标按钮保持固定正方形尺寸，图标居中；有文字命令时使用 icon + text。
- 警示卡片可以使用橙色描边和淡橙底，但不要引入三角以外的新警示形状体系。

如果一个状态需要超过三种形状来表达，说明设计错了；先合并状态，再画组件。

## Motion

Clinical Archive Motion 是 V3 的全站动效层。它服务临床档案控制台的进入感、切换感和响应感，不服务玩具感、营销感或新颜色系统。运行时统一由 `src/styles/transitions-dev.css` 输出 `t-*` class，组件只挂语义类。

- **Route reveal:** `/login`、`/app`、`/record/:id`、`/privacy`、`/brand-lockup-preview` 的页面主画布使用 `t-route-reveal`。入场只允许轻微位移、透明度和 blur 归位，不能旋转整页或制造沉重投影。
- **Stagger:** 登录品牌区、工作台输入/预览、病历 summary、时间线节点、证据卡、隐私条款卡、品牌候选卡使用 `t-stagger` 与 `--t-order` 顺序进入。节奏应像档案逐层展开，而不是卡片跳舞。
- **Controls:** 按钮、图标按钮、音乐播放器控制、导出、提交、tab 选项使用 `t-control-press`。点击反馈是压入与图标微位移，不改变尺寸、不挤压邻居。
- **Popover / accordion:** 背景音乐短侧舱、联系卡、认证 modal 反馈、OCR/保存/错误状态使用 `t-popover`；模型设置、登录 tab 内容和提示块使用 `t-accordion`。
- **Tab switch:** 登录邮箱/手机、病历详情档案/Gantt、模型设置模式选择使用 `t-tab-switch`，选中态可以有橙色焦点光，但不能新增蓝紫渐变。
- **Record motion:** 病历详情视图切换使用 `t-record-view`；纵向时间线 rail 使用 `t-timeline-rail` draw-in；Gantt 条使用 `t-gantt-grow` 从左向右生长，当前治疗线允许更明确的橙色强调。
- **Scene breathing:** 登录背景图可使用 `t-login-backdrop` 极慢呼吸，周期要长，幅度要小；普通工作区、隐私页、病历页禁止背景呼吸。
- **Reduced motion:** 所有新增 `t-*` 动效必须在 `prefers-reduced-motion: reduce` 中关闭 animation/transition，保留最终布局与语义。

禁用场景：长正文阅读过程、表格滚动、病历导出捕获区域、隐私条款正文、任何可能造成文字溢出或遮挡的容器。动效是系统反馈，不是注意力税。

## Components

**Responsive Sidebar:** 默认展开时显示 mark + 产品名、图标 + 标签导航、主题/语言/匿名/退出与系统状态卡；边界胶囊柄同时承担拖拽缩放、拖到隐藏与单击三态切换，不在品牌区额外放置显式隐藏按钮。拖拽变窄到阈值以下时自动 icon-only，并用 tooltip 保留短中文名，例如“提取”“病历”。隐藏侧栏后页面内容要自然占满，不能留下 72px 空白；左边缘恢复浮标只做提示，不抢占主内容层级，但允许作为渐进拉出的起点。

**Primary Button:** 橙底白字，用于“开始结构化提取”和登录验证。每屏只允许一个最强 CTA。

**Secondary Button:** 透明或白/黑底，1px 边界，用于导出 PDF、导出 PNG、返回工作台、修改参数。

**Text Area:** 大面积输入框保留 8px 圆角；focus 时使用橙色边界；右下角显示字符计数；不要用厚背景遮蔽输入区域。

**Status Chip:** 系统就绪、非晚期、阶段完成、AI verified 等状态使用小芯片。绿色只表示通过或健康，蓝色可用于“进行中”，橙色用于待补充。

**Missing Field Alert:** 缺失字段必须在表格内原位高亮，同时在右上形成汇总告警。告警文案短而具体，例如“待补充 3 项 · 第 0/3 轮追问”。

**Timeline:** 治疗线使用横向概览或纵向长卷二选一：工作台表格可以横向概览，病历详情必须纵向。编号 `01/02/03` 是视觉锚点，不能缩成普通项目符号。

**Clinical Cards:** 免疫组化、基因检测、疗效评估、耐药分析使用窄卡片承载键值数据；卡片内部用细线分隔，不使用厚表格网格。

**Auth Entry Scene:** 登录页首屏是未认证入口，不是工作台。它由背景图、Firefly mark、品牌标题、能力一句话、安全状态和一个橙色主 CTA 构成；主题、语言、背景音乐是右下角辅助工具，不参与主任务流。

**Auth Modal:** “身份访问控制台”以居中 modal 出现。它包含顶部 auth beacon 图像、邮箱/手机 tab、Google、微信敬请期待、匿名会话、隐私摘要、登录/注册/重置密码状态。该 modal 是 containment component，可使用登录专属圆角和阴影 token，但表单控件仍需沿用 `accent`、`success`、`text`、`border` 等语义。

**Provider Glyphs:** Google / WeChat 官方图形可保留品牌原色；这些颜色只存在于 provider glyph 内，不能成为产品 UI token。

## Implementation Contract

本文件是唯一设计系统真源；运行时代码是实现现实。视觉规则变化时，先更新本文件，再同步 token、CSS 与 system 组件，避免 `docs/products`、页面代码或截图批次继续生成第二套设计系统。

### Source Hierarchy

1. `docs/design/Image-2/V3/DESIGN.md` 定义设计系统语义、组件角色、布局骨架与截图优先级。
2. `src/lib/theme/tokens.ts` 与 `src/index.css` 承载运行时 token 与 CSS 变量。
3. `src/components/system/` 承载 Shell、Sidebar、TopBar、Main、Panel、Section、Action surface 等系统基元。
4. `src/components/ui/` 只承载 shadcn 原子组件，不定义项目级壳层语义。
5. `src/components/login-page-view.tsx` 当前承载登录 scene 的 component token maps（`loginThemeSkins`、`authCardSkins`）。这些 map 是登录入口的 bounded component tokens，不得被复制到其他页面；后续若继续扩展，应提升为 `src/lib/theme` 下的命名 token。
6. `src/styles/transitions-dev.css` 承载全站 `t-*` 动效语法；页面和组件只能消费语义 class，不在业务组件内发明 keyframes。
7. 页面路由只能组合 system/feature 组件并消费 token，不得直接发明新的颜色、surface、壳层结构、主题分支或局部动画系统。

### Runtime Geometry Rules

- `/app` 是响应式工作台，主内容默认使用全宽可用区域；输入区与报告预览只能在内部 grid 中分栏。
- `/record/:id` 是宽幅长卷档案，允许使用宽幅版心，但不能回退到固定窄画布；证据卡随断点从下方堆叠变为右侧栏。
- `/login` 是未认证入口页，不属于工作区壳层；首屏是 CTA 驱动的品牌场景，认证面板以 modal/dialog 承载，modal 宽度约 520-568px，整页必须保持响应式入口骨架。
- `/privacy` 与 `PrivacyGate` 属于阅读页或 modal，可以使用阅读宽度；这不是 app shell 的页面级宽度规则。
- 固定尺寸只允许出现在按钮、徽标、弹层、登录卡、图标按钮、短元数据块等局部组件。

### Change Rules

- 改设计，先改本文件；改实现，再改 runtime token 和 system component。
- 新颜色必须先归入既有 `accent`、`success`、`warning`、`surface`、`border` 或 `text` 语义；无法归入时先扩展 token contract。
- 新壳层结构必须先判断能否由 `src/components/system/` 现有基元承担。
- 新动效必须先归入 `route reveal`、`stagger`、`control press`、`popover`、`accordion`、`tab switch`、`record view` 或 `gantt grow` 语义；无法归入时先扩展 `transitions-dev.css` 合同和本文件 Motion 规则。
- 主题切换只改变材料、明暗和文字语气，不改变信息架构、操作位置或布局身份。
- 页面中出现散写 hex、未命名 surface、整页固定宽度或暗亮主题结构跳变，视为设计系统回归；唯一例外是登录 scene 已命名的 component token maps 与第三方 provider glyph 原色。

## Do's and Don'ts

- Do 保持暗亮主题同骨架、同组件、同状态语言，只改变材料明暗。
- Do 把橙色留给行动、焦点、风险和当前位置。
- Do 把登录页看作 CTA-driven entry scene：首屏建立信任，modal 承载身份输入。
- Do 使用 `t-*` 语义类建立进入、切换、响应三类动效，并始终保留 reduced-motion 退路。
- Do 让病历详情页纵向滚动，治疗节点按时间自然展开。
- Do 让临床缺失信息在原字段和汇总告警中同时可见。
- Do 在实现任何新页面前先检查本文件、V3 截图和对应 `CLAUDE.md`。
- Don't 把 `03-app-dark.png` 当作最终暗色工作台参考；使用 `03-app-dark-new.png`。
- Don't 新增紫蓝渐变、圆形光斑、营销式 hero 卡片，或把 auth modal 的强投影复制到普通工作区卡片。
- Don't 让按钮、输入框、卡片在 hover/focus 时改变尺寸。
- Don't 在业务组件里散写 keyframes、绕过 `transitions-dev.css`，或把动效当作新装饰系统。
- Don't 把绿色用于主要按钮或风险提示。
- Don't 为暗色和亮色分别发明两套组件行为；主题差异只能存在于材料，不存在于交互语法。

## References

- [Google Material Components](https://developer.android.com/design/ui/mobile/guides/components/material-overview?hl=en) 把 design system 定义为可复用设计决策的集合，通过 guidance、components、patterns 表达，并由 color、type、shape 等 primitive 组合成更复杂组件。
- [Material Web Theming](https://material-web.dev/theming/material-theming/) 的 token 分层可作为本项目实现模型：reference tokens 持有具体值，system tokens 定义角色，component tokens 把角色或具体值赋给某个组件；在 Web 上这些 tokens 以 CSS custom properties 或命名 token map 落地。
