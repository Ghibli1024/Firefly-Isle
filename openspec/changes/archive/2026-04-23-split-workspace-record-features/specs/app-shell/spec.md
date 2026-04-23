## ADDED Requirements

### Requirement: Route 文件必须只承担 orchestration 职责
系统 SHALL 让复杂页面 route 文件聚焦于入口、参数、状态机总线与 feature component 编排，而不是继续承载大段展示结构。

#### Scenario: workspace route 聚焦状态与编排
- **WHEN** 系统实现 `/app` 对应的 route 文件
- **THEN** route SHALL 保留提取、导出、持久化与 follow-up 状态机，并将输入区、追问区与报告预览区委派给独立 feature components

#### Scenario: record route 聚焦主题分发与编排
- **WHEN** 系统实现 `/record/:id` 对应的 route 文件
- **THEN** route SHALL 保留 dark / light 顶层分发与路由参数处理，并将总览头部、章节框架与信息卡等展示块委派给独立 feature components

### Requirement: 页面业务结构必须通过 feature 组件承载
系统 SHALL 在 design-system 的 `system` 层与 route 层之间建立 feature 组件中间层，用于承载页面专属业务结构，而不是把这些结构塞回 system 或继续留在 route 内。

#### Scenario: workspace feature 组件承载页面区块
- **WHEN** `/app` 页面需要渲染输入区、追问区或报告预览区
- **THEN** 这些区块 SHALL 由 `workspace` feature 组件承载，并继续消费现有 token 与 system shell

#### Scenario: record feature 组件承载章节结构
- **WHEN** `/record/:id` 页面需要渲染病历总览头部、章节框架或信息卡
- **THEN** 这些区块 SHALL 由 `record` feature 组件承载，而不是在 route 文件中重复拼装章节 scaffold

#### Scenario: feature 组件不侵入 design-system 语法层
- **WHEN** feature 组件组合 panel、section、action surface 或 shell
- **THEN** feature 组件 SHALL 复用 `src/components/system/` 里的设计系统基元，不得重新定义新的壳层语义
