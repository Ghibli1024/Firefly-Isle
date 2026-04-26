---
version: alpha
name: 一页萤屿 V3 Clinical Archive Console
description: V3 图像批次提取出的 Firefly-Isle 双主题设计系统；同一临床工作台骨架，在暗色控制室与亮色档案室之间切换。
colors:
  accent: "#E85D2A"
  accent-strong: "#FF4A1C"
  accent-soft: "#FCE9E1"
  success: "#43A56B"
  success-dark: "#2F8A57"
  warning: "#FF6B2A"
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
typography:
  display:
    fontFamily: "Inter, Noto Sans SC, sans-serif"
    fontSize: 56px
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: 0em
  title:
    fontFamily: "Inter, Noto Sans SC, sans-serif"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0em
  section:
    fontFamily: "Inter, Noto Sans SC, sans-serif"
    fontSize: 22px
    fontWeight: 650
    lineHeight: 1.28
    letterSpacing: 0em
  body:
    fontFamily: "Inter, Noto Sans SC, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: 0em
  label:
    fontFamily: "Inter, Noto Sans SC, sans-serif"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: 0em
  mono:
    fontFamily: "JetBrains Mono, SFMono-Regular, monospace"
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
  sidebar-expanded: 148px
  sidebar-min: 72px
  sidebar-max: 296px
  sidebar-label-threshold: 148px
  sidebar-collapsed: 72px
  shell-gutter: 24px
  panel-padding: 24px
  record-gutter: 32px
rounded:
  sm: 4px
  md: 8px
  lg: 12px
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
---

<!--
 * [INPUT]: 依赖 01-07 V3 截图、brief.md、Google DESIGN.md spec 的 frontmatter 与章节顺序
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

本文件来自 `docs/design/Image-2/V3/` 的截图提取。实现时以 `03-app-dark-new.png` 作为 `/app` 暗色参考，旧的 `03-app-dark.png` 仅保留生成历史；新版已经替换橙黑萤火 mark，并移除了“当前提取参数”区块，让病史输入后直接进入治疗时间线。

## Colors

颜色系统只允许一个真正的行动色：`accent` 橙。绿色只表示健康、完成、通过，不承担 CTA。暗亮主题不能各自发明新语汇，必须复用同一语义角色。

- **Accent `#E85D2A`:** 提取按钮、焦点边框、活动侧栏项、缺失字段、时间轴编号和关键警示。
- **Success `#43A56B`:** 系统就绪、阶段完成、AI 验证通过、档案完整。
- **Dark neutrals:** `dark-bg` 到 `dark-surface-raised` 形成黑色控制室的层级，文字使用暖白，弱信息使用灰米色。
- **Light neutrals:** `light-bg` 到 `light-surface` 形成白色档案纸面，边界使用暖灰，正文使用近黑。
- **Line `#8B8B86`:** 时间轴、分隔线和低优先级结构线，不能抢过橙色。

禁止把橙色扩散成背景氛围色。它只能出现在用户需要看见动作、风险或当前所在位置的地方。

## Typography

字体策略是“临床文档 + 仪表盘标签”。中文界面使用清晰的无衬线字体，技术状态和英文代号使用等宽字体。

- **Display:** 登录页和病历详情大标题，字重高、行距紧，承载品牌和页面身份。
- **Title / Section:** 面板标题、病史输入、治疗时间线等模块标题，保持左对齐。
- **Body:** 病历叙述、治疗说明、临床备注，必须适合长时间阅读。
- **Label:** 表单标签、按钮、状态说明、侧栏 tooltip，保持短句，不使用负字距。
- **Mono:** `CLINICAL HISTORY DOSSIER`、系统版本、英文代号、日期、模型/置信度等机器感信息。

所有字号随组件层级固定，不按 viewport 宽度缩放。标题的冲击力来自版面比例和留白，不来自无限放大。

## Layout

布局遵循“可变侧栏 + 纵向病历长卷”的骨架。

- **Shell:** 左侧导航默认展开，约 148px，默认即为 icon-only 窄栏；右侧边界线中部的无文字胶囊柄负责三态点击与拖拽调整宽度，最大约 296px；拖宽到 148px 以上才显示标签，回到 148px 及以下时标签文字自动隐藏，只保留 mark、图标、状态点和恢复控制；继续向左拖并越过隐藏浮标宽度后完全隐藏。隐藏后左边缘只保留一个小浮标用于点击恢复，同时支持从左边缘向右渐进拉出菜单。主内容与顶部状态条必须跟随同一个 sidebar offset。
- **Top bar:** 顶部只承载页面名、系统状态、帮助和设置，不塞入业务表单。
- **Workspace `/app`:** 病史输入在最上，导出与提取动作紧跟输入区；下方直接进入治疗时间线表格和缺失字段提示。
- **Record `/record/:id`:** 详情页必须是可滚动长卷，顶部概要之后进入纵向治疗时间轴，右侧卡片承载免疫组化、基因检测、疗效评估。
- **Login `/login`:** 左侧是品牌和能力说明，右侧是身份访问控制台；暗亮主题共享左右分栏骨架。
- **Component strip:** 组件状态必须成组出现，覆盖 active、hover、normal、disabled，避免实现时只做默认态。

不要把病历详情压缩成一屏控制台。这个产品的核心体验是“读完一份结构化病史”，滚动是信息秩序的一部分。

## Elevation & Depth

层级不靠厚阴影，靠材料差、边界和焦点线。

- **1px 边界:** 所有卡片、输入框、表格、状态芯片使用 1px 线建立结构。
- **2px 橙色焦点:** 只用于当前输入、活动导航、主要 CTA 和缺失字段。
- **Tonal layers:** 暗色用更亮一点的黑灰抬起面板；亮色用白色面板覆盖暖白页面底。
- **No heavy shadow:** 禁止大面积模糊投影。浮层可以使用轻微背景模糊，但必须保持边界清楚。
- **Login illustration:** 登录页可使用低对比医学线稿作为背景，但它必须退后，不能压过表单或标题。

深度的本质是“读者知道哪里可操作、哪里是证据、哪里是风险”，不是视觉炫技。

## Shapes

形状语言是工程化的温和锐利。

- 主容器、按钮、输入框、时间线卡片统一使用 **8px** 圆角。
- 小型状态点、编号圆、勾选状态使用 `full` 圆角。
- 卡片边界必须稳定，hover、focus、active 不得改变尺寸或造成布局跳动。
- 图标按钮保持固定正方形尺寸，图标居中；有文字命令时使用 icon + text。
- 警示卡片可以使用橙色描边和淡橙底，但不要引入三角以外的新警示形状体系。

如果一个状态需要超过三种形状来表达，说明设计错了；先合并状态，再画组件。

## Components

**Responsive Sidebar:** 默认展开时显示 mark + 产品名、图标 + 标签导航、主题/语言/匿名/退出与系统状态卡；边界胶囊柄同时承担拖拽缩放、拖到隐藏与单击三态切换，不在品牌区额外放置显式隐藏按钮。拖拽变窄到阈值以下时自动 icon-only，并用 tooltip 保留短中文名，例如“提取”“病历”。隐藏侧栏后页面内容要自然占满，不能留下 72px 空白；左边缘恢复浮标只做提示，不抢占主内容层级，但允许作为渐进拉出的起点。

**Primary Button:** 橙底白字，用于“开始结构化提取”和登录验证。每屏只允许一个最强 CTA。

**Secondary Button:** 透明或白/黑底，1px 边界，用于导出 PDF、导出 PNG、返回工作台、修改参数。

**Text Area:** 大面积输入框保留 8px 圆角；focus 时使用橙色边界；右下角显示字符计数；不要用厚背景遮蔽输入区域。

**Status Chip:** 系统就绪、非晚期、阶段完成、AI verified 等状态使用小芯片。绿色只表示通过或健康，蓝色可用于“进行中”，橙色用于待补充。

**Missing Field Alert:** 缺失字段必须在表格内原位高亮，同时在右上形成汇总告警。告警文案短而具体，例如“待补充 3 项 · 第 0/3 轮追问”。

**Timeline:** 治疗线使用横向概览或纵向长卷二选一：工作台表格可以横向概览，病历详情必须纵向。编号 `01/02/03` 是视觉锚点，不能缩成普通项目符号。

**Clinical Cards:** 免疫组化、基因检测、疗效评估、耐药分析使用窄卡片承载键值数据；卡片内部用细线分隔，不使用厚表格网格。

**Auth Panel:** 登录页右侧表单是“身份访问控制台”，tab、社交登录、邮箱凭证、匿名会话、主题和语言切换必须在同一面板内完成。

## Do's and Don'ts

- Do 保持暗亮主题同骨架、同组件、同状态语言，只改变材料明暗。
- Do 把橙色留给行动、焦点、风险和当前位置。
- Do 让病历详情页纵向滚动，治疗节点按时间自然展开。
- Do 让临床缺失信息在原字段和汇总告警中同时可见。
- Do 在实现任何新页面前先检查本文件、V3 截图和对应 `CLAUDE.md`。
- Don't 把 `03-app-dark.png` 当作最终暗色工作台参考；使用 `03-app-dark-new.png`。
- Don't 新增紫蓝渐变、圆形光斑、厚阴影或营销式 hero 卡片。
- Don't 让按钮、输入框、卡片在 hover/focus 时改变尺寸。
- Don't 把绿色用于主要按钮或风险提示。
- Don't 为暗色和亮色分别发明两套组件行为；主题差异只能存在于材料，不存在于交互语法。
