# src/lib/theme/
> L2 | 父级: /src/lib/CLAUDE.md

成员清单
tokens.ts: V3 主题 token 真相源，定义 dark/light 的 surface、text、border、accent、状态色、紧凑响应式侧栏几何、宽幅 shell 内容与 motion 合同，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
tokens.test.ts: V3 token 回归测试，锁住橙色主行动语义、light 侧栏 shell 归属、紧凑可变侧栏常量、宽幅 shell 内容类与 CSS 圆角合同，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 颜色先命名再使用，页面不直接发明 hex，主题切换先改 token 再改组件。
