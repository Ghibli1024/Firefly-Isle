<!--
 * [INPUT]: 依赖 V3 生产视觉真源、V4 评估视觉真源与当前登录/V4 OpenSpec 活动合同
 * [OUTPUT]: 对外提供项目级 DESIGN.md 入口，区分生产实现与候选评估边界并摘要当前登录入口合同
 * [POS]: Firefly-Isle 根目录设计入口，避免生产规范、评估规范与页面实现发生所有权漂移
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 -->

# Firefly-Isle DESIGN.md

当前正式产品的生产视觉真源仍是 [docs/design/Image-2/V3/DESIGN.md](docs/design/Image-2/V3/DESIGN.md)。下一代候选评估真源是 [docs/design/Image-2/V4/DESIGN.md](docs/design/Image-2/V4/DESIGN.md)，在产品负责人明确选择前不得替换 V3。

根目录只保留所有权入口，不复制完整 token 与组件规则。这样后续 Agent 能一眼区分“当前生产”与“下一代评估”，不会把推荐方向误当成已批准迁移。

## Production Design Source · V3

- `docs/design/Image-2/V3/DESIGN.md`: 从 V3 截图提取出的 Google `DESIGN.md` 格式设计系统。
- `docs/design/Image-2/V3/brief.md`: V3 批次来源、输出清单与截图优先级说明。
- `docs/design/Image-2/V3/03-app-dark-new.png`: `/app` 暗色工作台当前优先参考图。

`/login`、`/app`、`/record/:id`、`/analytics/:id`、`/privacy` 与 `/share/:code` 在方向被明确选定前继续消费 V3。

## Evaluation Design Source · V4

- `docs/design/Image-2/V4/DESIGN.md`: Clinical Calm、Firefly Glass、Living Archive 三方向的角色 token、排版、surface、响应式、可访问与动效合同。
- `docs/design/Image-2/V4/brief.md`: 候选比较目标、验证矩阵与截图交付清单。
- `/design-preview`: 使用同一虚构数据、同一 DOM 与同一信息架构比较 A/B/C × Light/Dark；不进入正式导航，不写全局主题偏好。

默认推荐 **A · Clinical Calm** 只表示当前设计判断，不表示产品负责人已经选择；正式迁移必须由后续 OpenSpec 变更承载。

## Active Login Entry Contract

- `/login` 是八章纵向滚动叙事：`hero → problem → intake → timeline → views → labs → boundary → cta`；章节内容只描述 `openspec/specs` 已实现能力。
- 首尾“登录” CTA 共享一个认证状态和一个 `AuthOverlay`；登录页不提供 Demo CTA，但 `/demo/*` 路由与能力继续保留。
- 首屏继续使用 `t-route-reveal` / `t-stagger`，后续章节由客户端 `useEffect` 内动态加载的 GSAP + ScrollTrigger 驱动；布局使用 CSS sticky + sibling spacer，不使用 GSAP `pin` 或平滑滚动劫持。
- 登录页只运行一个长生命周期液体折射 WebGL 背景；后续章节不得创建新的 Three.js 上下文，首屏离开可视区后由底层可见性观察暂停渲染，不销毁并重建 renderer。
- `prefers-reduced-motion: reduce` 保留全部八章内容，只取消滚动动画并收缩 spacer。

登录生产视觉仍见 V3 真源；参数、生命周期与验收合同见 `openspec/changes/add-scroll-story-landing/`。

## Rule

修改正式产品视觉时更新 V3；修改候选比较时更新 V4。未经明确选择，不得把 V4 token 或组件推广到正式路由；选择后新建迁移 OpenSpec，再调整生产真源。
