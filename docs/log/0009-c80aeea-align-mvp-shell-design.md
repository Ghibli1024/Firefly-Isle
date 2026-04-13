# c80aeea feat: align mvp shell with design sources

## 1. 基本信息
- Commit: `c80aeea`
- Message: `feat: align mvp shell with design sources`
- 时间顺序: 0009
- 日期: 2026-04-11
- 在当前仓库中的定位: `mvp-core` Commit 1 的设计对齐部分 / 从骨架升级到设计真相源复刻

## 2. 这次提交实际解决了什么
- 把 `docs/design/dark/*`、`docs/design/light/*` 的 HTML 与截图真相源正式纳入仓库。
- 大幅重写 `app-shell`、`index.css`、`login-page.tsx`、`record-page.tsx`、`workspace-page.tsx`，让页面从“有骨架”升级到“按设计稿复刻”。

## 3. 是怎么一步一步完成的
1. 先把 dark/light 设计真相源导入到 `docs/design/`，包括：
   - `code.html`
   - `screen.png`
   - 设计系统说明文档
2. 再用这些输入重写壳层与三类 route 页面，使 dark/light 视觉与结构真正贴合设计稿。
3. 同步修订 `mvp-core` 中 app-shell / theme-system 的 spec 与 tasks，把“完全复刻设计稿”从口头要求变成文档约束。
4. 已证实命令：无。
5. 推定但未证实命令：设计资源很可能经历过文件拷贝/整理动作，但当前没有原始命令证据，因此不补写具体 CLI。

## 4. 遇到的问题
- 用户后来明确拒绝“工程近似”，要求完全复刻 Stitch/设计稿；这笔提交正是从那种压力下成长出来的。
- 由于设计输入量很大，这次提交天然体量很重，后续阅读成本高。

## 5. 证据
- `git show --stat c80aeea`: `docs/design/{dark,light}`、`src/components/app-shell.tsx`、三类 route 页面、`src/index.css` 的大幅变更
- `openspec/changes/mvp-core/tasks.md` 中 1.6 ~ 1.6d 与之直接对应

## 6. 我的判断
- 这次提交才真正让 Commit 1 达到“设计来源可追溯”的要求。
- 它把设计从抽象约束变成了具体文件真相源。

## 7. 置信度
- 当前等级: 高
- 原因: 除了 diff 明确，后续完整会话也反复强调“必须完全复刻设计稿”，可较高把握地还原这笔提交的真实意图。
