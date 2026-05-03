## ADDED Requirements

### Requirement: 壳层暴露全局音乐控制
系统 SHALL 在登录入口与已登录应用壳层中暴露同一个全局音乐控制能力，并保持现有路由职责、布局几何与业务边界不变。

#### Scenario: 登录入口提供音乐控制
- **WHEN** 用户访问 `/login`
- **THEN** 登录介绍区域 SHALL 提供音乐控制
- **AND** 音乐控制 SHALL 与现有主题切换、语言切换工具共享同一入口工具语法
- **AND** 音乐控制 SHALL NOT 打开登录弹层、触发认证请求或改变已输入表单值

#### Scenario: 已登录页面提供音乐控制
- **WHEN** 用户访问 `/app` 或 `/record/:id`
- **THEN** 应用壳层 SHALL 提供音乐控制
- **AND** 音乐控制 SHALL 复用共享 shell action 语义，而不是在每个 route 文件中重复实现
- **AND** 音乐控制 SHALL NOT 改变侧栏宽度、顶部区域职责、主内容起始线或主要操作位置

#### Scenario: 主题和语言切换不重置音乐状态
- **WHEN** 用户切换 dark/light 主题或 zh/en 语言
- **THEN** 音乐控制 SHALL 保持当前音乐状态
- **AND** 音乐控制 SHALL 使用当前主题 token 与当前语言标签重新渲染
