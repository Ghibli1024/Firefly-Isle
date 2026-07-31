## 1. Specification

- [x] 1.1 定义首次打开默认暂停、已保存播放意图继续恢复的 background-audio delta。

## 2. Implementation

- [x] 2.1 将空值和未知背景音乐偏好解析为 `paused`，保留 `playing` / `paused` 与历史 `on` / `off` 兼容。
- [x] 2.2 更新控制器和壳层静态渲染测试，证明首次访问不调用 `play()`，显式播放意图仍可恢复。

## 3. Validation And Documentation

- [x] 3.1 同步 baseline background-audio spec 与 changes 目录索引。
- [x] 3.2 运行背景音乐专项测试、类型检查和构建。
