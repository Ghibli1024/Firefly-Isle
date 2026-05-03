# background-audio-playlist Specification

## Purpose
TBD - created by archiving change add-local-background-playlist. Update Purpose after archive.
## Requirements
### Requirement: 本地背景歌单由显式曲目清单定义
系统 SHALL 使用显式曲目清单定义本地授权背景音乐，每首曲目包含稳定 id、展示标题、来源链接与本地 public 音频路径。

#### Scenario: 默认曲目清单包含用户指定歌曲
- **WHEN** 系统初始化背景音乐能力
- **THEN** 系统 SHALL 暴露两首本地背景音乐曲目
- **AND** 默认曲目 SHALL 为 `Nagisa Sakano Shitano Wakare`
- **AND** 每首曲目 SHALL 指向本地 public 音频路径而不是 Apple Music 流媒体地址

#### Scenario: 缺失本地文件不破坏应用
- **WHEN** 曲目清单中的本地音频文件不存在或无法播放
- **THEN** 系统 SHALL 保持应用可用
- **AND** 系统 SHALL 将背景音乐状态更新为不可用或可恢复的未播放状态
- **AND** 系统 SHALL NOT 尝试从 Apple Music 下载替代音频

### Requirement: 当前曲目独立于开关偏好持久化
系统 SHALL 持久化用户选择的背景音乐曲目，并继续独立持久化现有音乐开关偏好。

#### Scenario: 用户选择曲目
- **WHEN** 用户选择上一首、下一首或指定曲目
- **THEN** 系统 SHALL 更新当前曲目
- **AND** 系统 SHALL 持久化当前曲目的稳定 id
- **AND** 系统 SHALL NOT 改写用户的音乐开关偏好

#### Scenario: 已保存曲目失效
- **WHEN** 本地存储中的曲目 id 不存在于当前曲目清单
- **THEN** 系统 SHALL 回退到曲目清单中的第一首歌
- **AND** 系统 SHALL 保持应用可用

### Requirement: 歌单支持上一首、下一首与结束后自动前进
系统 SHALL 为背景音乐提供上一首、下一首和曲目结束后自动进入下一首的行为。

#### Scenario: 下一首循环前进
- **WHEN** 用户在最后一首曲目上触发下一首
- **THEN** 系统 SHALL 切换到第一首曲目
- **AND** 如果音乐偏好为开启，系统 SHALL 请求播放新曲目

#### Scenario: 上一首循环后退
- **WHEN** 用户在第一首曲目上触发上一首
- **THEN** 系统 SHALL 切换到最后一首曲目
- **AND** 如果音乐偏好为开启，系统 SHALL 请求播放新曲目

#### Scenario: 当前曲目结束
- **WHEN** 当前背景音乐曲目播放结束
- **THEN** 系统 SHALL 自动切换到下一首曲目
- **AND** 如果音乐偏好为开启，系统 SHALL 请求播放新曲目
