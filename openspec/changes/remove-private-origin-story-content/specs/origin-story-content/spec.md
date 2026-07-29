## ADDED Requirements

### Requirement: 创作初衷只展示公开来源的简要整理
系统 SHALL 将顶栏“创作初衷”纸页的可见正文限制为项目维护者编写的简要公开摘要，不得展示、镜像或拼接任何非公开来源的正文。

#### Scenario: 打开创作初衷纸页
- **WHEN** 用户从已登录应用顶部的帮助入口打开创作初衷纸页
- **THEN** 系统 SHALL 显示公开摘要、来源归属和医疗决策边界
- **AND** 系统 SHALL NOT 显示非公开来源的正文或静态预览副本

### Requirement: 每个阅读呈现层提供同一可点击来源链接
系统 SHALL 为 Canvas/WebGL 纸页、无 WebGL 降级页和辅助技术文本使用同一个规范化来源 URL，并以可点击链接呈现。

#### Scenario: 使用 WebGL 阅读纸页
- **WHEN** 浏览器支持 WebGL 且纸页舞台成功初始化
- **THEN** 系统 SHALL 在画布上层显示可点击的来源链接
- **AND** 链接 SHALL 在新标签页打开并使用 `rel="noreferrer"`

#### Scenario: 使用降级阅读页
- **WHEN** 浏览器不支持 WebGL 或用户偏好减少动态效果
- **THEN** 系统 SHALL 显示同一份公开摘要和同一来源链接
- **AND** 用户 SHALL 能通过键盘访问该链接

### Requirement: 移除旧静态预览及可控历史对象
系统 SHALL 移除旧内容的运行时与静态预览入口，并从项目可控的 Git branches、tags 和特殊 refs 中清除承载旧内容的路径和对象。

#### Scenario: 构建当前发布包
- **WHEN** 系统执行生产构建和 Capacitor sync
- **THEN** 生成的 Web、iOS 和 Android 静态资源 SHALL 不含旧静态预览文件或旧内容对象

#### Scenario: 审计受控 Git refs
- **WHEN** 维护者扫描本地或远端的项目可控 refs 与对象数据库
- **THEN** 扫描 SHALL 不返回承载旧内容的已识别对象或已移除路径
