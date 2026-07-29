## Why

创作初衷纸页曾引用不适合公开发布的材料。该页面及其历史对象需要改为仅使用明确公开的来源，并为读者保留可核验的原帖入口。

## What Changes

- **BREAKING**：移除旧的非公开纸页正文及其静态预览资源，不保留可公开访问的副本。
- 将顶栏“创作初衷”纸页改为对指定公开 YouTube 社区帖的简要整理，而不是原文转载。
- 在 WebGL、无 WebGL 降级与辅助技术文本中提供同一个可点击的原帖链接。
- 重写可控 Git refs，去除承载旧内容的历史路径与对象；刷新原生壳中由 Web 构建生成的静态资源。

## Capabilities

### New Capabilities
- `origin-story-content`: 定义创作初衷纸页仅展示公开摘要、来源归属和安全外链的内容合同。

### Modified Capabilities
- None.

## Impact

- Affected code: `src/components/system/origin-story/`、顶栏引用、测试及 Capacitor 生成的 Web 资源。
- Affected artifacts: `public/origin-close-pin-preview.html` 和包含旧路径的历史 refs。
- External source: [YouTube 社区帖子](https://www.youtube.com/post/Ugkx2pyfj6hZm_j7M4tjutIm7D9BFqg-mfyB)。
