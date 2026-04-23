## Context

工作区页已经把输入区、追问区和报告预览区拆到 feature 组件，但报告区仍残留双层甚至三层壳：

- route 层先渲染“临床结构化报告”标题与横线；
- `ReportPreviewFrame` 再包一层外框；
- `TimelineTable` 自己又是完整的 shell。

用户评论直指这个重复壳层：最外层“临床结构化报告”应该消失，下方直接展示治疗时间线表格。

## Decisions

### 1. route 层不再渲染报告区标题壳

- **Decision**: `workspace-page.tsx` 直接把报告区入口交给 `ReportPreviewFrame`，不再在 route 层渲染“临床结构化报告”标题与横线。
- **Rationale**: route 负责 orchestration，不负责再给 feature 区块添加装饰性标题 scaffold。

### 2. ReportPreviewFrame 只保留必要信息，不重复包主表面

- **Decision**: `ReportPreviewFrame` 不再额外把 `TimelineTable` 包在新的总框架标题/总边框中；`TimelineTable` 直接作为主表面。
- **Rationale**: `TimelineTable` 本身已经有完整 shell，继续包壳只会制造边框套边框。

### 3. 补充信息保留，但退到主表面之后

- **Decision**: 仍然允许在 `TimelineTable` 之后展示临床备注、AI 验证或声明类信息，但这些内容不再宣称自己是新的“报告壳”。
- **Rationale**: 去掉的是冗余容器，不是信息本身。

## Verification

- 组件/路由回归测试确认 dark / light `/app` 都不再渲染“临床结构化报告”标题。
- 浏览器截图确认报告区首屏直接进入 `TimelineTable`，而不是先出现额外标题壳。
