## Context

当前前端已经具备 dark / light 双主题、页面级设计复刻、时间线表格的主题化渲染与主题切换持久化能力，但主题实现仍以页面直接消费颜色与边框值为主：`app-shell.tsx`、`workspace-page.tsx`、`TimelineTable.tsx`、登录页与档案页都在散写 surface、rule、text 与 accent 颜色。与此同时，dark / light 壳层虽然服务同一产品，但侧栏宽度、顶部角色、分隔线语义与背景层级没有被统一的设计系统合同约束，导致主题切换时会出现布局跳变与材质突变。现有 `docs/design/dark/*`、`docs/design/light/*` 与 Stitch 页面映射可以作为上游设计证据，但仓库里还没有一套可强约束实现的 token / component / parity design contract。

## Goals / Non-Goals

**Goals:**
- 把 dark / light 主题切换从页面级样式切换提升为设计系统驱动的主题切换。
- 定义统一的 Theme Geometry Contract，让侧栏宽度、顶部空间角色、主内容起始线、版心宽度和壳层结构在 dark / light 间保持同构。
- 定义统一的 Dark Surface Contract，收敛 dark 模式可允许的 background / panel / inset / rule / accent 层级，禁止继续在业务组件中发明新的 dark 颜色。
- 引入明确的 token 与系统组件边界，让页面只能从设计系统消费颜色与组件，而不是继续散写 hex 值与结构语义。
- 让 `app-shell`、工作区、档案页、登录页与时间线表格共享同一套 theme parity 规则。

**Non-Goals:**
- 不在本轮改变业务流程、数据模型、Auth、LLM 或导出逻辑。
- 不新增第三套主题或为移动端单独设计新的主题体系。
- 不追求一次性重写所有页面细节；本轮目标是建立可约束后续实现的系统边界并完成壳层与关键页面的统一。
- 不替换 shadcn/ui 基础设施；本轮在其之上补齐项目自己的 design-system layer。

## Decisions

### 1. 主题切换采用“同构骨架 + 不同材质”的设计原则
- **Decision**: dark / light 共享相同的空间角色和布局几何，只允许在 token、字体语气、边框粗细与装饰细节上分化。
- **Rationale**: 当前突兀感的主因不是动画缺失，而是主题切换时结构角色发生漂移。统一骨架后，主题切换会从“换布局”变成“换材质”。
- **Alternatives considered**:
  - 保留 dark / light 两套完全不同的壳层结构：能保留更强风格差异，但切换体验会持续突兀，也无法形成稳定设计系统。
  - 仅补 CSS transition：只能掩盖材质切换，无法解决结构漂移。

### 2. dark sidebar 不再作为独立纯黑宇宙，而是回归同一 dark surface 语义系统
- **Decision**: dark 主题定义有限层级的 surface token（base / shell / panel / inset / rule / accent），sidebar 与 main shell 必须来自同一套 dark surface contract，而不是各自使用未命名黑色。
- **Rationale**: 纯黑 sidebar 只有在被定义为独立空间域时才合理；本轮既然要求顶栏与壳层角色同构，就应避免 sidebar 成为主题中的特殊黑洞。收敛表面层级后，dark 自身内部也会更统一。
- **Alternatives considered**:
  - 保留 sidebar 纯黑以强化控制台感：风格更强，但与 main shell 的层次断裂更明显，难以降低主题切换突兀感。
  - 完全只保留单一黑背景：层次会过于单薄，无法表达面板与内嵌面差异。

### 3. 设计系统必须显式分层为 tokens、system components、feature pages
- **Decision**: 在当前 `src/components/ui/` 和 `src/lib/utils.ts` 基础上，引入项目级 design-system layer：
  - `tokens`：颜色、文字、border、surface、spacing、motion 语义 token
  - `system components`：AppShell、Sidebar、TopBar/Masthead、Panel、SectionHeader、ActionButton、Surface 容器等
  - `feature pages`：工作区、登录页、档案页只组合系统组件，不直接发明视觉语义
- **Rationale**: shadcn/ui 只解决原子组件，不覆盖本项目真正的视觉骨架。若没有 system components，页面仍会继续散写布局与视觉语义。
- **Alternatives considered**:
  - 仅靠 `ui/` + `index.css`：无法收敛 shell、surface、section header 这类项目特有视觉结构。
  - 所有页面直接消费 token：比现在好，但仍容易在页面层复制结构逻辑。

### 4. 设计证据保留在 docs/design，但实现真相必须迁移为 design system token/component contract
- **Decision**: `docs/design/dark/*`、`docs/design/light/*` 与 Stitch 页面映射继续作为上游证据源；实现层不再直接散读页面细节，而是把这些证据提炼为 token、surface contract 与 component contract。
- **Rationale**: 页面素材是设计输入，不是前端运行时的设计系统。只有把设计语言折叠为 contract，后续迭代才不会再次依赖人工比对页面截图。
- **Alternatives considered**:
  - 继续以页面 HTML / screenshot 为直接真相源：能短期对齐页面，但会让系统长期停留在逐页复制而非系统演化状态。

### 5. 主题统一以“先 contract，后迁移”的方式推进
- **Decision**: 先定义 geometry contract、surface contract、token contract 和 component contract，再逐步迁移壳层与关键页面。
- **Rationale**: 当前最大问题是缺失规则，不是缺少 tweak。先写 contract 能避免边改边发明新例外。
- **Alternatives considered**:
  - 直接边改页面边整理：速度快，但容易重新回到散写状态。

## Risks / Trade-offs

- **[Risk] 设计系统抽象过早，反而拖慢页面收口** → **Mitigation**: 只抽取已经在多个页面重复出现且与主题切换直接相关的 token / shell / surface / section 结构，不为未来假想组件预留层级。**
- **[Risk] 若一次性迁移所有页面，改动面过大且难验证** → **Mitigation**: 先迁移 `app-shell`、工作区、时间线表格与登录/档案页共享壳层，再收其他页面细节。**
- **[Risk] docs/design 与实现 contract 理解不一致** → **Mitigation**: 在 design system 文档中明确列出每个 token 和系统组件对应的设计证据来源，减少自由解释空间。**
- **[Risk] 过度强调同构导致 dark/light 丢失各自语气** → **Mitigation**: 只统一结构角色，不统一字体、线条粗细、装饰与 editorial tone。材质差异保留，结构漂移消失。**
- **[Risk] 现有散写颜色大量存在，短期内无法完全禁绝** → **Mitigation**: 在本轮把所有壳层与主题关键路径收进 token；未迁移区域作为显式技术债，后续继续收口。**

## Migration Plan

1. 在 change 内先定义 theme parity contract，并把 requirements 落到 `theme-system` 与 `app-shell` delta specs。
2. 设计并引入设计系统 token 命名方案，至少覆盖 background、surface、text、rule、accent、motion。
3. 抽离壳层系统组件与表面组件，让 `app-shell` 成为主题同构规则的第一落点。
4. 迁移工作区、时间线表格、登录页、档案页，使其改为消费 token 和系统组件。
5. 清理页面中残留的散写主题 hex 与结构语义，补齐对应 CLAUDE 文档。
6. 通过视觉对比与交互验证确认 dark / light 切换只改变材质与语气，不再改变结构角色。
7. 若迁移过程中出现不可接受回归，可回滚至当前页面实现，同时保留 contract 文档作为下一轮迁移基础。

## Open Questions

- dark sidebar 最终是否完全并入 `dark.base` / `dark.shell`，还是允许作为 `dark.sidebar` 保留一层独立 token，但仍属于同一 contract？
- design-system layer 最终放在 `src/components/system/`、`src/lib/theme/` 还是其他目录，怎样最符合当前仓库的文件分层？
- 是否在本轮顺手补一份专门面向协作者和 agent 的设计系统文档（如 `docs/products/design-system.md`），作为 token / component contract 的语义镜像？
