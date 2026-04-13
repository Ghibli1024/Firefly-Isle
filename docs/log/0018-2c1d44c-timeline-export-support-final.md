# 2c1d44c feat: add timeline export support

## 1. 基本信息
- Commit: `2c1d44c`
- Message: `feat: add timeline export support`
- 时间顺序: 0018
- 日期: 2026-04-12
- 在当前仓库中的定位: `mvp-core` Commit 9（9.1 ~ 9.4）的真正完成提交

## 2. 这次提交实际解决了什么
- 把导出能力从“依赖已安装”补齐成“用户真的能从 `/app` 导出 PDF / PNG”。
- 在 `workspace-page.tsx` 内加入 html2canvas / jsPDF 组合的实际运行代码，以及 loading / error UI。
- 同步 README 与 tasks，使 9.x 的完成状态回到和代码现实一致。

## 3. 是怎么一步一步完成的
1. 先回头核对历史，而不是直接补代码。
   - 关键判断：`c2f18fe` 只加了依赖，真正的导出逻辑仍未落地。
2. 用历史与真相源对齐工具重新确认现状。
   - 当前有明确证据出现过的检查命令：
     - `git log --oneline`
     - `openspec instructions apply --change "mvp-core" --json`
3. 在 `src/routes/workspace-page.tsx` 中把运行时代码真正补齐：
   - html2canvas 截图
   - PNG blob 下载
   - jsPDF 生成 PDF
   - 统一文件名
   - loading / error UI
4. 再把 README 与 `mvp-core/tasks.md` 同步回现实，修复“标题像是完成了，但代码其实没完成”的历史漂移。
5. 收口前继续做本地校验。
   - 证据明确出现过的命令：
     - `npm run build`
     - `npm run lint`
6. 未证实命令：虽然在收 8.x / 9.x 时显然还用过更多 git / 浏览器检查手段，但当前材料不足以逐条还原，因此不补猜测命令。

## 4. 遇到的问题
- 8.x / 9.x 的 worktree、tasks、历史与队友消息曾严重漂移，甚至一度以为 Commit 8 需要重做，后来才确认 `fef6349` 已经存在。
- 用户明确选择了“先拆再提交”，这迫使我们先搞清真相源，再收 9.x，而不是在混乱状态下盲推。

## 5. 证据
- `git show --stat 2c1d44c`: 关键文件是 `src/routes/workspace-page.tsx`，并伴随 README/tasks 同步
- 后续 10.x、11.x 验证都以这次导出链路为基础
- 会话中明确把它认定为“real export commit”

## 6. 我的判断
- 这是一次典型的“把标题补成事实”的纠偏提交。
- 它的意义不仅是导出能用，更是修复历史与现实的漂移。

## 7. 置信度
- 当前等级: 高
- 原因: 有明确的历史歧义、用户选择、代码补齐与后续验证记录共同支撑。
