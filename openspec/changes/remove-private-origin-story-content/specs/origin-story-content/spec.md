## ADDED Requirements

### Requirement: 创作初衷忠实整理用户指定的公开来源
系统 SHALL 将顶栏“创作初衷”弹层的可见正文限制为用户指定公开 YouTube 帖子的忠实段落整理，不得展示、镜像或拼接任何非公开来源的正文。

#### Scenario: 打开创作初衷弹层
- **WHEN** 用户从已登录应用顶部的生命故事图标入口打开创作初衷
- **THEN** 系统 SHALL 显示公开故事、来源归属和医疗决策边界
- **AND** 系统 SHALL NOT 显示非公开来源的正文或静态预览副本

### Requirement: 正文末尾展示同一纯文本来源地址
系统 SHALL 使用一个规范化来源 URL，并将来源标签与 URL 作为故事正文最后一个纯文本段落呈现，不得显示独立超链接控件。

#### Scenario: 阅读公开故事
- **WHEN** 创作初衷弹层打开
- **THEN** 系统 SHALL 直接以低调元数据、副标题和故事正文开始内容，不重复绘制可见主标题
- **AND** 系统 SHALL 在最后一个故事段落之后显示同一来源标签与 URL
- **AND** 来源地址 SHALL NOT 使用 `<a>` 元素、外链箭头或悬浮胶囊呈现
- **AND** 医疗免责声明 MAY 作为低优先级 footer 位于来源段落之后

### Requirement: 创作初衷使用 V3 临床档案阅读弹层
系统 SHALL 使用 V3 Clinical Archive Console 的共享主题 token 和单一 DOM dialog 展示创作初衷，不得为该长正文入口创建专属 Canvas、纸张纹理、布料模拟或 WebGL 上下文。

#### Scenario: 在暗色或亮色工作区打开弹层
- **WHEN** 用户在任一生产主题中打开创作初衷
- **THEN** 弹层 SHALL 复用 `--ff-surface-*`、`--ff-text-*`、`--ff-border-*`、字体与圆角 token
- **AND** 暗亮主题 SHALL 保持同一信息骨架与交互结构
- **AND** 所有故事段落 SHALL 使用普通正文权重，包括最后一段

#### Scenario: 使用键盘操作弹层
- **WHEN** 键盘用户打开创作初衷
- **THEN** 系统 SHALL 将焦点移入弹层并提供始终可见的关闭按钮
- **AND** Tab 焦点 SHALL 保持在弹层内
- **AND** Esc SHALL 关闭弹层
- **AND** 关闭后焦点 SHALL 返回顶部入口

#### Scenario: 在窄屏设备阅读
- **WHEN** 视口不足以容纳桌面阅读面板
- **THEN** 弹层 SHALL 使用近全屏布局和单一内部滚动区域
- **AND** 正文、来源与免责声明 SHALL 不被裁切

### Requirement: 移除旧静态预览及可控历史对象
系统 SHALL 移除旧内容的运行时与静态预览入口，并从项目可控的 Git branches、tags 和特殊 refs 中清除承载旧内容的路径和对象。

#### Scenario: 构建当前发布包
- **WHEN** 系统执行生产构建和 Capacitor sync
- **THEN** 生成的 Web、iOS 和 Android 静态资源 SHALL 不含旧静态预览文件或旧内容对象

#### Scenario: 审计受控 Git refs
- **WHEN** 维护者扫描本地或远端的项目可控 refs 与对象数据库
- **THEN** 扫描 SHALL 不返回承载旧内容的已识别对象或已移除路径
