## 1. 文档边界与结构搭建

- [x] 1.1 创建 `docs/log/` 目录与对应 `CLAUDE.md`，定义 commit history 文档模块职责
- [x] 1.2 创建 `docs/log/index.md` 作为 commit history 总入口，列出时间顺序、文件命名规则与阅读方式

## 2. Commit history 内容落地

- [x] 2.1 依据 `git log` 梳理当前仓库非 merge 提交列表，按时间顺序建立文件名映射（含序号、hash、slug）
- [x] 2.2 为每个 commit 创建独立 Markdown 文件，并写入统一模板（基本信息、完成过程、问题、证据、判断、置信度）
- [x] 2.3 为高置信度提交补充一步一步的完成过程、已证实命令与问题记录；对只能重建的提交显式标注“不确定 / 待补录”与未证实命令

## 3. 文档同步与收口

- [x] 3.1 更新根 `CLAUDE.md` 与受影响的目录文档，纳入 `docs/log/` 模块入口
- [x] 3.2 复核所有 commit 日志均以 git hash 为唯一标识，未混入 `mvp-core`，并确认后续维护走独立 docs/log change
