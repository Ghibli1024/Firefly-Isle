## Why

当前没有保存音乐偏好的新用户会被当作“播放中”处理，应用启动时会主动请求播放。默认静音更符合用户预期，也不会改变已经明确选择播放或暂停的用户行为。

## What Changes

- 将没有保存偏好的首次访问状态改为 `paused`，启动时不自动调用 `play()`。
- 保留已保存的 `playing` / `paused` 意图，并兼容历史 `on` / `off` 值。
- 更新背景音乐控制器测试与 baseline spec，覆盖首次访问和已保存偏好的恢复语义。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

- `background-audio`: 修改首次打开应用时的默认播放意图与自动播放边界。

## Impact

- 影响 `src/lib/background-audio.tsx` 的本地偏好读取逻辑。
- 影响 `src/lib/background-audio.test.ts` 与 `src/components/background-music-toggle.test.tsx` 的默认状态断言。
- 更新 `openspec/specs/background-audio/spec.md`；不新增音频资源，不改变故事栏或业务流程。
