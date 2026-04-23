## Purpose

定义 Firefly-Isle MVP 的页面壳层、三类核心页面、主题切换空间角色与登录页入口边界。

## Requirements

### Requirement: MVP 仅包含三类 Web 页面结构
系统 SHALL 在 MVP 中仅围绕登录页面、临床工作区、档案详情三类 Web 页面组织界面结构，并要求这三类页面在 dark / light 主题间共享同一套壳层空间角色。

#### Scenario: 页面结构范围
- **WHEN** 实现 MVP 前端页面结构
- **THEN** 系统 SHALL 仅以登录页面、临床工作区、档案详情作为基础页面结构，不要求实现 Mobile 页面结构

#### Scenario: dark / light 页面共享空间角色
- **WHEN** 系统在同一 Web 页面上切换 Dark 或 Light 主题
- **THEN** 侧栏、顶部区域、主内容区、版心与报告容器 SHALL 保持同构空间角色，而不是因主题切换变成不同信息架构

### Requirement: 页面结构必须复刻设计稿
系统 SHALL 以 `docs/design/dark/` 与 `docs/design/light/` 中对应页面导出的 HTML / screenshot 作为页面结构实现的设计证据源，并将这些结构约束折叠为统一的壳层几何合同，同时允许根据用户浏览器评论收敛入口页噪声与错误壳层语义。

#### Scenario: 登录页复刻 Dark / Light 页面结构
- **WHEN** 系统实现 `/login` 的 Dark 或 Light 页面
- **THEN** 页面 SHALL 对齐对应设计稿的结构语气，并通过共享壳层合同保持主题切换时的空间角色一致

#### Scenario: 登录页不显示工作区导航
- **WHEN** 未认证用户访问 `/login`
- **THEN** 登录页 SHALL 不显示工作区侧栏导航项，例如“提取”“病历”“统计”
- **AND** 登录页 SHALL 不因隐藏侧栏而保留侧栏宽度偏移

#### Scenario: 登录页主题切换是页面级控制
- **WHEN** 系统渲染 `/login` 的 Dark 或 Light 页面
- **THEN** 主题切换控件 SHALL 作为页面级 utility 呈现
- **AND** 它 SHALL 不作为认证卡片标题行的一部分呈现

#### Scenario: 临床工作区复刻 Dark / Light 页面结构
- **WHEN** 系统实现 `/app` 的 Dark 或 Light 页面
- **THEN** 页面 SHALL 对齐对应设计稿的主画布、导航脊柱与信息区语义，并保持主内容起始线与版心关系在主题切换时一致

#### Scenario: 档案详情复刻 Dark / Light 页面结构
- **WHEN** 系统实现 `/record/:id` 的 Dark 或 Light 页面
- **THEN** 页面 SHALL 对齐对应设计稿的病历概览区、主表格区与侧栏结构，并复用统一的壳层几何合同

#### Scenario: 临床工作区与档案详情保留应用壳层导航
- **WHEN** 已认证用户访问 `/app` 或 `/record/:id`
- **THEN** 页面 SHALL 保留工作区导航与会话出口能力

### Requirement: 主题切换作用于全局页面结构
系统 SHALL 将主题切换能力放置在应用壳层中，并要求主题切换只改变材质和设计系统映射，不改变壳层空间关系。

#### Scenario: 主题切换作用于全局页面结构
- **WHEN** 用户切换主题
- **THEN** 主题变化 SHALL 作用于登录页面、临床工作区和档案详情等全局页面结构，而不是仅作用于局部组件

#### Scenario: 主题切换不改变侧栏宽度与顶部角色
- **WHEN** 用户在 Dark 与 Light 间切换
- **THEN** 侧栏宽度、顶部区域职责、主内容起始线与主要分隔关系 SHALL 保持不变

### Requirement: 壳层几何必须通过统一合同定义
系统 SHALL 为 App Shell 定义统一的 geometry contract，至少覆盖侧栏宽度、顶部空间角色、主内容起始线、主区版心宽度与壳层分隔线语义。

#### Scenario: 侧栏宽度固定同构
- **WHEN** 壳层渲染 Dark 或 Light 主题侧栏
- **THEN** 侧栏 SHALL 使用同一宽度合同，不得一侧使用比例宽度而另一侧使用固定宽度

#### Scenario: 顶部区域承担同一空间职责
- **WHEN** 壳层渲染 Dark top bar 或 Light masthead
- **THEN** 两者 SHALL 承担同一空间角色，用于定义主内容上边界与版心起始关系，而不是一个作为外挂工具条、另一个作为独立信息架构头图

#### Scenario: 分隔线语义可解释
- **WHEN** 壳层渲染边框、规则线或强调线
- **THEN** 每条线 SHALL 属于结构边界、区块边界或强调线之一，不得保留没有明确语义的装饰性边线

### Requirement: 壳层必须通过设计系统组件组合
系统 SHALL 让登录页、工作区与档案页通过统一的壳层级系统组件组合页面，而不是在每个页面内重复拼装主题结构。

#### Scenario: 页面复用壳层系统组件
- **WHEN** 登录页、工作区或档案页需要渲染 sidebar、top bar、masthead、panel 或 section header
- **THEN** 页面 SHALL 复用设计系统定义的壳层组件，而不是在页面文件中重新发明结构与视觉语义
