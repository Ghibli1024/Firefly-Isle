# fa28ed8 fix: align Pages build env with wrangler config

## 1. 基本信息
- Commit: `fa28ed8`
- Message: `fix: align Pages build env with wrangler config`
- 时间顺序: 0022
- 日期: 2026-04-13
- 在当前仓库中的定位: 11.x 发布环境问题的关键修复提交

## 2. 这次提交实际解决了什么
- 修复了 Cloudflare Pages 线上 bundle 读不到 `VITE_SUPABASE_*` 环境变量的问题。
- 具体做法是把三项构建期所需变量直接写进 `wrangler.jsonc > vars`，并把这次踩坑经验同步到 README 与发布检查清单。

## 3. 是怎么一步一步完成的
1. 先不靠猜，直接查真实生产状态。
   - 做过的动作包括：
     - 用 Cloudflare API 查 Pages 项目、deployment、custom domain、DNS
     - 直接打开 `firefly-isle.pages.dev` 与 `firefly.ghibli1024.com`
   - 先排除掉：
     - DNS
     - TLS
     - custom domain
     - Pages project 不存在
2. 然后抓生产构建日志，而不是只看前端页面报错。
   - 在日志里抓到关键句：
     - `Build environment variables: (none found)`
3. 基于这个日志，判断不是你填写的值错，而是构建期 env 根本没注入到 Vite。
4. 于是把构建期需要的 3 个前端变量直接写进 `wrangler.jsonc > vars`：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SUPABASE_EDGE_FUNCTION_URL`
5. 同步文档，把这次真实踩坑经验写进：
   - `README.md`
   - `docs/operations/release-checklist.md`
6. 之后提交并 push。
7. push 之后继续验证生产环境，确认匿名登录、提取、编辑、导出最终都恢复。
8. 中途又遇到一个二次问题：
   - 重新部署 `llm-proxy` 时如果没带 `--no-verify-jwt`，匿名 token 会被函数网关挡成 401
- 已证实命令：`git commit -m "fix: align Pages build env with wrangler config"`、`git push origin main`、`supabase functions deploy llm-proxy --project-ref irkjblpzmclqekxbexll --no-verify-jwt`。
- 未证实命令：Cloudflare API 查询与构建日志抓取过程是真实存在的，但当前材料未完整保留原始调用命令或参数，因此不把具体 API/CLI 命令写死。

## 4. 遇到的问题
- 初始排查非常容易误以为是 DNS、TLS、Custom Domain 或 Pages env 名字填错；实际上这些都不是根因。
- 真正的坑在于：Cloudflare 这次构建读取了 `wrangler.jsonc`，但 build-time env 没有注入，导致最新生产 bundle 仍然编译成“缺少 Supabase 环境变量”的版本。
- 修完这个问题后，又短暂把 `llm-proxy` 部署成了开启网关 JWT 校验的版本，导致匿名会话被 401；最后重新用 `--no-verify-jwt` 部署才恢复全部生产链路。

## 5. 证据
- `git show --stat fa28ed8`: 只改 `wrangler.jsonc`、`README.md`、`docs/operations/release-checklist.md`
- 生产构建日志关键证据：`Build environment variables: (none found)`
- 修复后，线上 `firefly-isle.pages.dev` 与 `firefly.ghibli1024.com` 都能走到匿名登录、提取、编辑、导出与刷新恢复

## 6. 我的判断
- 这是 11.x 里最像“真实上线修 bug”的提交：范围小，但定位和修复都非常关键。
- 它把“纸面部署成功”推进成“真正可运行的生产前端”。

## 7. 置信度
- 当前等级: 高
- 原因: 具备完整的 Cloudflare API 查询、生产验证、构建日志、修复提交与后续结果证据。
