# specs/
> L2 | 父级: /openspec/changes/add-scroll-story-landing/CLAUDE.md

成员清单
scroll-story-landing/spec.md: 滚动叙事落地页 delta spec，定义章节顺序契约、ScrollTrigger 进度绑定、非 pin 分层、静态渲染与卸载清理、reduced-motion 降级行为，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
app-shell/spec.md: 登录入口结构 delta spec，约束 /login 单路由内滚动叙事与 CTA 驱动统一登录弹层、取消 Demo CTA、不侵入已登录壳层，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
demo-mode/spec.md: Demo 入口 delta spec，约束登录页不再提供 Demo CTA 且 /demo 公开路由行为保持不变，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
theme-system/spec.md: 叙事视觉 delta spec，约束章节双主题 token 共享与主题切换不重置滚动进度，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: specs 只写用户可观察行为，不写 React 文件或 CSS 类细节。
