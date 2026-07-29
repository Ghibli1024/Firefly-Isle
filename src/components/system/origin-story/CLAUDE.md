# origin-story/
> L2 | 父级: /src/components/system/CLAUDE.md

成员清单
CLAUDE.md: 说明创作初衷纸页子模块的边界与成员清单，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
origin-story-content.ts: 创作初衷纸页的唯一公开内容源，集中提供摘要、来源归属、来源地址、拼接正文与页脚文案，被纸页弹层和 Canvas 纹理层复用，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
origin-story-content.test.ts: 公开内容与来源 URL 合同测试，阻止展示层重新引入非公开材料，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
origin-story-canvas.ts: 创作初衷纸页 Canvas 纹理层，负责纸张底纹、摘要排版、长文画布与滚动视口纹理绘制，被 WebGL 纸页材质消费，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
origin-story-paper.tsx: 顶栏问号触发的创作初衷纸页，导出 OriginStoryPaper、calculateOriginStoryStageBox 与 getOriginStoryClothBudget，使用 Three.js WebGL、Verlet 粒子约束、全屏自适应阅读舞台、可点击的公开来源链接、拖拽性能预算与暗档案遮罩，保留降级与可访问文本副本，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
origin-story-paper.test.ts: 创作初衷纸页舞台尺寸与 WebGL 布料性能预算回归测试，用数值断言覆盖全屏桌面、窄屏移动、低高度窗口和拖拽性能上限，不再通过源码字符串约束尺寸实现，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 内容、纹理、交互三相分离；纸页入口只编排，不吞并素材与绘制细节。
