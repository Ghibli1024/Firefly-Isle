## Why

创作初衷入口曾引用不适合公开发布的材料，后续替换页面又形成了与 V3 产品视觉割裂的羊皮纸/WebGL 展示。该入口及其历史对象需要只保留明确公开的来源，并回归项目现有 Clinical Archive Console 视觉与交互体系。

## What Changes

- **BREAKING**：移除旧的非公开正文及其静态预览资源，不保留可公开访问的副本。
- 将顶栏“创作初衷”内容改为对指定公开 YouTube 社区帖的忠实段落整理，不引入任何非公开内容。
- 删除正文顶部重复的可见主标题；将同一个原帖标签和 URL 作为正文最后一个纯文本段落，不单独显示可点击控件。
- 删除羊皮纸 Canvas、Three.js 布料模拟与 WebGL/降级双路径，改为消费 V3 surface/text/border token 的暗亮同构临床档案阅读弹层。
- 全部故事段落使用普通正文权重；以边界、间距和细橙色阅读轨建立层级，不通过尾段加粗制造独立文风。
- 重写可控 Git refs，去除承载旧内容的历史路径与对象；刷新原生壳中由 Web 构建生成的静态资源。

## Capabilities

### New Capabilities
- `origin-story-content`: 定义创作初衷展示指定公开故事、正文末尾纯文本来源和 V3 临床档案阅读弹层的内容与交互合同。

### Modified Capabilities
- None.

## Impact

- Affected code: `src/components/system/origin-story/`、顶栏引用、工作区合同测试及 Capacitor 生成的 Web 资源。
- Removed runtime path: `origin-story-canvas.ts` 及创作初衷专属 Canvas/WebGL 纹理与布料模拟。
- Affected artifacts: `public/origin-close-pin-preview.html` 和包含旧路径的历史 refs。
- External source: [YouTube 社区帖子](https://www.youtube.com/post/Ugkx2pyfj6hZm_j7M4tjutIm7D9BFqg-mfyB)。
