## MODIFIED Requirements

### Requirement: 主题实现必须来源于设计系统
系统 SHALL 将 `docs/design/Image-2/V3/DESIGN.md` 与同目录 V3 截图作为当前视觉系统真源，并将运行时主题实现收敛为统一的设计系统 token、surface contract 与系统组件；旧 `docs/design/dark/*`、`docs/design/light/*` 与 Stitch 设计来源仅作为历史证据，不得覆盖 V3。

#### Scenario: Dark / Light 主题通过统一 token 实现
- **WHEN** 系统渲染 Dark 或 Light 主题
- **THEN** 颜色、文字层级、边框、surface 层级、圆角、状态色与强调色 SHALL 来自统一命名的设计系统 token，而不是在业务组件中直接散写十六进制值

#### Scenario: V3 是当前视觉真源
- **WHEN** 实现需要判断视觉取舍
- **THEN** 系统 SHALL 优先参考 `docs/design/Image-2/V3/DESIGN.md`
- **AND** `/app` dark SHALL 优先参考 `docs/design/Image-2/V3/03-app-dark-new.png`
- **AND** 旧 `03-app-dark.png` SHALL 仅作为生成历史，不作为实现优先参考

#### Scenario: 页面只能消费设计系统组件与 token
- **WHEN** 工作区、登录页、档案页、隐私页或时间线表格实现主题相关结构
- **THEN** 页面 SHALL 通过设计系统组件与 token 组合视觉结果，而不是在页面中重复拼装新的主题结构与表面语义

#### Scenario: 设计素材被提炼为 contract 而非直接运行时依赖
- **WHEN** 系统需要依据 V3 截图对齐主题语言
- **THEN** 实现 SHALL 先将这些证据提炼为 token、surface contract 与 component contract，再由页面消费这些 contract

### Requirement: 支持手动切换为 Light
系统 SHALL 提供显式主题切换能力，允许用户在应用中从 Dark 切换到 Light，且切换只改变材质、排版语气与 token 映射，不改变结构角色。

#### Scenario: 用户切换到 Light
- **WHEN** 用户触发主题切换控件
- **THEN** 系统 SHALL 将当前主题切换为 Light，并立即以对应 token 集合更新界面材质、文字与边框表现

#### Scenario: 主题切换保持结构同构
- **WHEN** 用户在 Dark 与 Light 主题间切换
- **THEN** 侧栏宽度、顶部空间角色、主内容起始线、版心关系、组件角色与主要操作位置 SHALL 保持一致，不得因主题切换而改变页面结构角色

## ADDED Requirements

### Requirement: V3 色彩语义必须保持一致
系统 SHALL 将橙色作为唯一主要行动/焦点/风险色，将绿色仅用于系统健康、完成或通过状态，不得在 Light 主题中以黑色作为主要行动色。

#### Scenario: 橙色作为唯一主要行动色
- **WHEN** 页面渲染主要 CTA、活动导航项、焦点边框、缺失字段或风险告警
- **THEN** 这些元素 SHALL 使用 V3 action/accent token
- **AND** Dark 与 Light 主题 SHALL 使用同一语义色，而不是各自发明主要行动色

#### Scenario: 绿色仅表达健康或完成
- **WHEN** 页面渲染系统就绪、阶段完成、AI 验证通过或档案完整状态
- **THEN** 这些元素 MAY 使用绿色状态 token
- **AND** 绿色 SHALL NOT 用于主按钮、缺失字段或风险提示

### Requirement: V3 形状与层级必须来自组件语义
系统 SHALL 使用 V3 的 8px 主圆角、1px 结构边界与 2px 橙色焦点线表达层级，不得通过全局 `border-radius: 0 !important` 或厚阴影抹除组件语义。

#### Scenario: 主组件保留 V3 圆角
- **WHEN** 页面渲染按钮、输入、面板、卡片、时间线节点或状态芯片
- **THEN** 这些组件 SHALL 使用 V3 token 定义的圆角层级
- **AND** 全局 CSS SHALL NOT 强制所有元素圆角为 0

#### Scenario: 层级不依赖厚阴影
- **WHEN** 页面需要表达 panel、inset、focus 或 active 状态
- **THEN** 系统 SHALL 优先使用 tonal layers、边界和焦点线
- **AND** 系统 SHALL NOT 使用大面积模糊阴影制造通用 dashboard 深度
