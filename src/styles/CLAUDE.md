# src/styles/
> L2 | 父级: /src/CLAUDE.md

成员清单
transitions-dev.css: 正式产品共享动效工具，以短促 transform/opacity 进入、精细指针 hover、克制 press/文字 tab/icon 反馈和统一 reduced-motion 为合同，并独立保留登录滚动叙事 sticky/spacer/视图叠层几何，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
transitions-dev.test.ts: 共享产品动效合同回归测试，验证 V3 motion budget、Button 过渡、路由 reveal/stagger 分离、旧 tab bounce 清除与 reduced-motion 边界，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
design-preview.css: /design-preview 唯一样式聚合入口，只按 token → shell → data → responsive 顺序导入隔离 V4 样式层，[PROTOCOL]: 新增、删除或重排预览样式分层时更新此头部与 CLAUDE.md
design-preview-tokens.css: V4 三候选双材料 role token、根级隔离、focus 与基础交互合同，只允许 .ff-v4-* 命名空间并仅引用全局 localized font token，[PROTOCOL]: 变更候选 token、基础交互或主题隔离时更新此头部、V4 DESIGN.md 与 CLAUDE.md
design-preview-shell.css: V4 评估栏、方向摘要、产品壳层、侧栏、顶栏、患者状态与通用 section 几何，不承载候选 token 或 viewport 断点，[PROTOCOL]: 变更预览壳层、患者摘要或 section 几何时更新此头部、V4 DESIGN.md 与 CLAUDE.md
design-preview-data.css: V4 异常摘要、指标、图表、时间线、次级动作、候选装饰与唯一切换 keyframe，不定义全局主题或断点，[PROTOCOL]: 变更语义状态、数据展示或候选装饰时更新此头部、V4 DESIGN.md 与 CLAUDE.md
design-preview-responsive.css: V4 1320/1080/760/520px 收敛、390px 安全布局与 reduced-motion 降级，只调整已有 .ff-v4-* 结构，[PROTOCOL]: 变更断点、移动溢出或 reduced-motion 时更新此头部、V4 DESIGN.md 与 CLAUDE.md

法则: 正式产品动效集中命名，组件只挂语义类；V4 评估样式必须 namespaced、按职责分层，并在明确选择前不得被生产组件消费。
