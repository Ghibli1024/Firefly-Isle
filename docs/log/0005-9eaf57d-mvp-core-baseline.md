# 9eaf57d chore: add mvp-core baseline

## 1. 基本信息
- Commit: `9eaf57d`
- Message: `chore: add mvp-core baseline`
- 时间顺序: 0005
- 日期: 2026-04-11
- 在当前仓库中的定位: `mvp-core` 的大基线提交 / 规格与工程入口第一次大规模对齐

## 2. 这次提交实际解决了什么
- 大规模补齐了项目基线：`docs/products/*`、`package.json`、`src/` 入口文件、`public/` 静态资源，以及 `mvp-core` 下新增 capability specs。
- 这次提交把仓库从“有 change 壳子”推进到“有产品背景、有工程入口、有前端目录骨架”的状态。

## 3. 是怎么一步一步完成的
1. 先把产品真相源写进仓库：
   - `docs/products/prd.md`
   - `docs/products/spec.md`
   - `docs/products/stitch-screen-mapping.md`
2. 再补工程基线文件：
   - `package.json`
   - `src/*`
   - `public/*`
   - `tsconfig*`
   - `vite.config.ts`
3. 最后扩展 `mvp-core` 的 design/specs/tasks，让 app-shell、theme-system、deployment、asset-storage 等边界正式进入 change。
4. 已证实命令：无。
5. 推定但未证实命令：从新增的 Vite/TypeScript 工程文件看，极可能经历过类似 `npm create vite@latest` 或等价初始化动作，但当前不能把它写成确定事实。

## 4. 遇到的问题
- 这是一个非常宽的基线提交，范围天然偏大，后续需要通过更细的 Commit 1~11 边界把实现重新拉回可控节奏。
- 设计输入此时仍主要体现在产品文档和 spec 描述中，真正的 HTML / screenshot 真相源还没全部落进来。

## 5. 证据
- `git show --stat 9eaf57d`: 27 个文件，既有 docs/products，也有 package/src/public 与 spec 变更
- `openspec/changes/mvp-core/specs/{app-shell,asset-storage,theme-system,deployment}` 在此阶段进入仓库

## 6. 我的判断
- 这是一笔“建舞台”提交，不是功能闭环提交。
- 它为后面真正的 Commit 1（脚手架与页面骨架）准备了可落地的仓库环境。

## 7. 置信度
- 当前等级: 中
- 原因: 产物范围清楚，但过程更多是根据 diff 重建，细节深度不如后面直接参与的提交。
