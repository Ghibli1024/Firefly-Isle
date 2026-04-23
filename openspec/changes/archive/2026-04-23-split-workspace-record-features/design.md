## Context

`unify-theme-system` 已经把主题系统折叠为 token 真相源、system shell/surface 组件与页面消费链路，但 `workspace-page.tsx` 与 `record-page.tsx` 仍然保留较厚的展示结构。`workspace-page.tsx` 目前同时承担 route orchestration、提取状态机和多个 feature block 的 JSX 渲染；`record-page.tsx` 则保留 dark/light 两套长篇章节结构和重复的 section scaffold。当前 design-system 已经稳定，下一步的重点不是继续改 token，而是建立 feature-level 中间层，让 route 文件回到编排职责。

## Goals / Non-Goals

**Goals:**
- 为 `workspace-page.tsx` 建立 `workspace` feature 组件层，抽离输入区、追问区和报告预览区。
- 为 `record-page.tsx` 建立 `record` feature 组件层，抽离病历总览头部、章节框架与信息卡。
- 保持现有 design-system token、system shell 与 route-level theme 分发不变。
- 减少 route 文件中的大段展示结构与重复 scaffold，让 route 文件主要负责 orchestration。
- 同步建立新目录的文档契约，让 `system / feature / route` 三层边界可读且稳定。

**Non-Goals:**
- 不改 `src/lib/theme/tokens.ts` 或 `src/index.css` 的核心 token contract，除非拆分中发现明显缺失。
- 不重构 `src/components/system/` 的职责边界。
- 不拆 `workspace-page.tsx` 中的提取、导出、持久化等状态机逻辑。
- 不改变 `record-page.tsx` 的 dark/light 顶层分发方式。
- 不改变任何业务行为、数据流、导出结果、权限边界或路由结构。

## Decisions

### 1. 建立 feature 层，而不是继续把 route 当页面组件仓库
- **Decision**: 新增 `src/components/workspace/` 与 `src/components/record/` 两个目录，承载页面业务结构组件。
- **Rationale**: 当前 `system/` 已经负责设计语法，再把 feature block 继续留在 route 中，会让 route 既像 controller 又像 view。新增 feature 层能把页面业务结构放到正确的位置。
- **Alternatives considered**:
  - 继续在 route 文件内局部整理 JSX：改动小，但不会改变结构问题。
  - 把 feature block 塞进 `system/`：会污染 design-system，让业务语义进入全局设计语法层。

### 2. `workspace-page.tsx` 只拆展示层，不拆状态机
- **Decision**: 保留 `useExtractionState()`、导出逻辑、持久化逻辑与 route orchestration，只把输入区、追问区与报告预览区拆到 feature 组件。
- **Rationale**: 当前主要问题是 UI 结构过厚，不是状态机错误。现在拆状态机会放大风险并模糊数据流。
- **Alternatives considered**:
  - 同时拆状态机为多个 hooks：理论上更细，但会让本轮变成业务流重构，超出范围。

### 3. `record-page.tsx` 保留 dark/light 顶层分发，只抽重复章节框架与展示块
- **Decision**: 保留 `DarkRecordPage` / `LightRecordPage` 两个顶层 route 编排函数，但抽出 `record-summary-header`、`record-section-frame` 与 `record-side-card` 等 feature 组件。
- **Rationale**: 这页的主题语气差异较大，强行合并成单一大组件会让抽象变脆。保留双主题总编排，同时消除重复章节 scaffold，收益最高。
- **Alternatives considered**:
  - 把 dark/light 整页合并成单组件：统一表面上更漂亮，但会引入大量条件分支，反而更晦涩。

### 4. route / feature / system 三层边界必须显式成立
- **Decision**:
  - `system/`：只承载 design-system 语法
  - `feature/`：承载页面业务结构块
  - `routes/`：只做入口、参数、状态机总线与 feature 组件编排
- **Rationale**: 这是当前架构继续演化的关键边界，不立起来的话下次还会回到 route 巨石文件。

## Risks / Trade-offs

- **[Risk] 组件拆得太碎，反而造成过度抽象** → **Mitigation**: 只抽离语义闭合的块（输入区、追问区、报告预览框架、章节框架、总览头部、信息卡），不为了行数而拆空壳组件。**
- **[Risk] `workspace-page.tsx` 状态机仍然较长，拆完后用户误以为问题已彻底解决** → **Mitigation**: 本轮明确只处理展示层；状态机保持完整是有意为之，后续若要重构业务流需单独开 change。**
- **[Risk] `record-page.tsx` dark/light 双主题仍然保留两个顶层函数，被误解为没有统一** → **Mitigation**: 明确这页的统一目标是“共享 feature frame + 保留主题语气”，不是把所有主题编排强行并表。**
- **[Risk] 新增 `workspace/` 与 `record/` 目录后，文档不同步** → **Mitigation**: 本轮把 `CLAUDE.md` 与 L3 注释纳入明确任务，结构变化必须同步语义镜像。**

## Migration Plan

1. 新建 `src/components/workspace/` 与 `src/components/record/`，补 L2 文档。
2. 先拆 `workspace` feature blocks：`follow-up-panel`、`extraction-composer`、`report-preview-frame`。
3. 重写 `workspace-page.tsx`，让其仅保留状态机与 feature 编排。
4. 再拆 `record` feature blocks：`record-section-frame`、`record-summary-header`、`record-side-card`。
5. 重写 `record-page.tsx`，保留 dark/light 顶层分发，减少重复章节 scaffold。
6. 更新相关 `CLAUDE.md` 与 L3 文件头。
7. 运行 build/lint/test，并人工检查 route 文件体积与可读性是否显著改善。

## Open Questions

- `workspace` feature 目录第一轮是否只收 3 个组件，还是顺手把 report footer 也拆出？
- `record` 侧是否需要第一轮就引入单独的 `record-status-badge`，还是等重复度再高一点再抽？
- `workspace-page.tsx` 中的状态机在本轮拆完展示层后，是否仍然值得后续单开 change 继续拆 hook？
