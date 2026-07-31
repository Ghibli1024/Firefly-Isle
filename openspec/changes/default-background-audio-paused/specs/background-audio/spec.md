## MODIFIED Requirements

### Requirement: 应用提供全局背景音乐控制器
系统 SHALL 在应用级别维护一个背景音乐控制器，用于管理单一音频源、播放状态、用户播放/暂停意图与浏览器自动播放结果。

#### Scenario: 首次打开时默认保持暂停
- **WHEN** 用户打开应用且本地没有保存背景音乐偏好
- **THEN** 系统 SHALL 将背景音乐偏好初始化为暂停
- **AND** 系统 SHALL 保持音乐控制展示为可恢复的暂停状态
- **AND** 系统 SHALL NOT 自动调用音频播放方法

#### Scenario: 已保存播放意图时恢复播放
- **WHEN** 用户打开应用且本地已保存播放偏好
- **THEN** 系统 SHALL 请求播放配置的背景音乐
- **AND** 系统 SHALL 将播放中、暂停、加载失败或自动播放被拦截等结果记录为可渲染状态

#### Scenario: 路由切换不创建重复音乐
- **WHEN** 用户在 `/login`、`/app`、`/record/:id` 或 `/privacy` 之间导航
- **THEN** 系统 SHALL 继续使用同一个背景音乐控制器
- **AND** 系统 SHALL NOT 因路由切换创建第二个音频实例或重置用户偏好
