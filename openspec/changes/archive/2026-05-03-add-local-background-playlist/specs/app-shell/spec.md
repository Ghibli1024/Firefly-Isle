## ADDED Requirements

### Requirement: 音乐控制暴露简洁歌单操作
系统 SHALL 在现有全局音乐控制中暴露当前曲目文本与上一首/下一首操作，并保持登录入口和已登录壳层的空间职责不变。

#### Scenario: 登录入口展示当前曲目
- **WHEN** 用户访问 `/login`
- **THEN** 登录介绍区域的音乐控制 SHALL 展示当前曲目标题
- **AND** 音乐控制 SHALL 提供上一首和下一首操作
- **AND** 音乐控制 SHALL NOT 打开登录弹层、触发认证请求或改变已输入表单值

#### Scenario: 已登录壳层展示紧凑歌单控制
- **WHEN** 用户访问 `/app` 或 `/record/:id`
- **THEN** 应用壳层 SHALL 在共享 shell action 区域展示音乐开关、当前曲目文本、上一首和下一首操作
- **AND** 该控制 SHALL 复用共享音乐组件，而不是在 route 文件中重复实现
- **AND** 该控制 SHALL NOT 改变侧栏宽度、主内容起始线或核心业务操作位置

#### Scenario: 歌单控制具备可访问语义
- **WHEN** 系统渲染上一首或下一首控制
- **THEN** 控制 SHALL 暴露可访问标签
- **AND** 控制 SHALL 支持键盘触发
- **AND** 当前曲目标题 SHALL 作为可读文本呈现
