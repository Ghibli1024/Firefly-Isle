<!--
 * [INPUT]: 依赖 docs/design/Image-2/V3/DESIGN.md 的当前视觉系统定义
 * [OUTPUT]: 对外提供项目级 DESIGN.md 入口，链接到当前设计真源
 * [POS]: Firefly-Isle 根目录设计入口，避免根目录与批次目录维护两份规范
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 -->

# Firefly-Isle DESIGN.md

当前项目设计真源是 [docs/design/Image-2/V3/DESIGN.md](docs/design/Image-2/V3/DESIGN.md)。

根目录只保留入口，不复制完整 token 与组件规则。这样后续 Agent 读取项目根目录时能找到设计系统，同时不会产生两份会漂移的 `DESIGN.md`。

## Current Design Source

- `docs/design/Image-2/V3/DESIGN.md`: 从 V3 截图提取出的 Google `DESIGN.md` 格式设计系统。
- `docs/design/Image-2/V3/brief.md`: V3 批次来源、输出清单与截图优先级说明。
- `docs/design/Image-2/V3/03-app-dark-new.png`: `/app` 暗色工作台当前优先参考图。

## Rule

修改视觉系统时，先更新 V3 的完整 `DESIGN.md`，再确认这个入口仍指向当前真源。
