# 88ddc4a feat: add deployment baseline and privacy page

## 1. 基本信息
- Commit: `88ddc4a`
- Message: `feat: add deployment baseline and privacy page`
- 时间顺序: 0020
- 日期: 2026-04-13
- 在当前仓库中的定位: 11.x 部署基线的主提交（11.1 ~ 11.3 的主要内容）

## 2. 这次提交实际解决了什么
- 为 11.x 建立了第一批真正可落地的发布基线：GitHub Actions workflow、Cloudflare Pages 配置文件、独立隐私条款页 `/privacy`、发布检查清单与最小测试。
- 它把“还没上线的产品”推进到“具备上线骨架”的状态。

## 3. 是怎么一步一步完成的
1. 先把 CI 的检查链路补全，而不是先急着点云平台部署。
   - 当时引入/确认的命令链路：
     - `npm run lint`
     - `npm run type-check`
     - `npm run test`
     - `npm run build`
2. 再把这些命令固化进 `.github/workflows/ci-cd.yml`，让 GitHub Actions 在 `main` push / 手动触发时串起来。
3. 然后补 Cloudflare Pages 所需的仓库内基线文件：
   - `public/_headers`
   - `public/_redirects`
   - `wrangler.jsonc`
4. 与部署基线一起补产品入口隐私页，而不是把隐私条款继续埋在门控弹窗里。
   - 关键文件：
     - `src/routes/privacy-page.tsx`
     - `src/components/privacy-gate.tsx`
     - `src/components/login-page-view.tsx`
     - `src/App.tsx`
5. 最后补最小测试与发布检查文档，让 11.x 不是“只有配置文件”，而是有校验、有检查表、有入口页面的完整基线。
6. 已证实命令：
   - `npm run lint`
   - `npm run type-check`
   - `npm run test`
   - `npm run build`
7. 未证实命令：依赖安装与部分中间检查步骤没有完整 shell 记录，因此不把它们写成确定事实。

## 4. 遇到的问题
- 最初很容易想当然地把 11.4 / 11.5 一起勾掉，但真实发布环境还没建立，因此这次提交必须克制，只收 11.1 ~ 11.3 的“基线”。
- 由于本地历史没有压成一个单 commit，后续又多出 `3cc545a` 这个 wrangler 补丁提交，导致 11.x 的历史略显碎片化。

## 5. 证据
- `git show --stat 88ddc4a`: 28 个文件，覆盖 workflow、Pages 配置、隐私页、tests、docs 与多层 `CLAUDE.md`
- 本地 CI 在当时已经能完整跑通：lint / type-check / test / build
- 会话中明确把它定义为“11.1~11.3 可提交内容”的主体

## 6. 我的判断
- 这次提交的价值在于“把上线所需的非功能性能力第一次真正落到仓库里”。
- 也是从产品实现视角切换到发布治理视角的分水岭。

## 7. 置信度
- 当前等级: 高
- 原因: 有完整的代码、文档、验证与发布前决策记录支撑。
