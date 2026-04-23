## 1. Spec and regression guard

- [x] 1.1 创建 change proposal，记录工作区报告预览去壳需求
- [x] 1.2 添加回归测试，先确认 `/app` 仍存在多余报告标题壳

## 2. Report shell flattening

- [x] 2.1 去掉 `workspace-page.tsx` 中报告区 route 层的“临床结构化报告”外层标题壳
- [x] 2.2 收敛 `ReportPreviewFrame` 外部包裹层，让 `TimelineTable` 直接成为主表面
- [x] 2.3 确认 dark / light 两个主题下都不再产生边框套边框

## 3. Verification and docs

- [x] 3.1 同步受影响的 CLAUDE 文档与 L3 头部
- [x] 3.2 运行相关测试
- [x] 3.3 运行 `npm run lint`
- [x] 3.4 运行 `npm run build`
