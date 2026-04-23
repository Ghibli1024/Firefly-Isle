## 1. Workspace feature extraction

- [x] 1.1 创建 `src/components/workspace/` 目录与 `CLAUDE.md`，定义 workspace feature 层职责边界
- [x] 1.2 抽离 `follow-up-panel.tsx`，让追问补充区离开 `workspace-page.tsx`
- [x] 1.3 抽离 `extraction-composer.tsx`，收口输入区、错误提示与主要 action 区
- [x] 1.4 抽离 `report-preview-frame.tsx`，统一报告预览外框与 `TimelineTable` 包裹结构
- [x] 1.5 重写 `workspace-page.tsx`，保留状态机与 route 编排，不再承载大段展示结构

## 2. Record feature extraction

- [x] 2.1 创建 `src/components/record/` 目录与 `CLAUDE.md`，定义 record feature 层职责边界
- [x] 2.2 抽离 `record-section-frame.tsx`，统一章节序号、标题、副标题与 badge scaffold
- [x] 2.3 抽离 `record-summary-header.tsx`，收口病历总览头部区块
- [x] 2.4 抽离 `record-side-card.tsx`，统一 IHC / genetic / protocol / risk 等信息卡结构
- [x] 2.5 重写 `record-page.tsx`，保留 dark / light 顶层分发，不再重复拼装长篇章节结构

## 3. Documentation and verification

- [x] 3.1 更新 `src/components/CLAUDE.md` 及新增目录文档，反映 `workspace/` 与 `record/` feature 层
- [x] 3.2 为新增组件补 L3 文件头注释，并同步必要的 route 文件头说明
- [x] 3.3 运行 `npm run build`
- [x] 3.4 运行 `npm run lint`
- [x] 3.5 运行 `npm run test`
- [x] 3.6 人工复核拆分后 route 文件是否明显变薄，且 system / feature / route 三层边界更清晰
