## MODIFIED Requirements

### Requirement: 主题实现必须来源于设计系统
系统 SHALL 将 `docs/design/dark/*`、`docs/design/light/*` 与 Stitch 页面映射作为设计证据源，并将运行时主题实现收敛为统一的设计系统 token、surface contract 与系统组件；页面不得继续直接发明主题颜色、边框层级或壳层结构语义。

#### Scenario: Dark / Light 主题通过统一 token 实现
- **WHEN** 系统渲染 Dark 或 Light 主题
- **THEN** 颜色、文字层级、边框、surface 层级与强调色 SHALL 来自统一命名的设计系统 token，而不是在业务组件中直接散写十六进制值

#### Scenario: 页面只能消费设计系统组件与 token
- **WHEN** 工作区、登录页、档案页或时间线表格实现主题相关结构
- **THEN** 页面 SHALL 通过设计系统组件与 token 组合视觉结果，而不是在页面中重复拼装新的主题结构与表面语义

#### Scenario: 设计素材被提炼为 contract 而非直接运行时依赖
- **WHEN** 系统需要依据 `docs/design/dark/*`、`docs/design/light/*` 或 Stitch 页面映射对齐主题语言
- **THEN** 实现 SHALL 先将这些证据提炼为 token、surface contract 与 component contract，再由页面消费这些 contract

### Requirement: 默认主题为 Dark
系统 SHALL 在用户首次进入应用且不存在已保存主题偏好时使用 Dark 主题。

#### Scenario: 首次访问默认主题
- **WHEN** 用户首次进入应用且本地不存在主题偏好
- **THEN** 系统 SHALL 使用设计系统中定义的默认 Dark token 集合，而不是自由选择页面级颜色

### Requirement: 支持手动切换为 Light
系统 SHALL 提供显式主题切换能力，允许用户在应用中从 Dark 切换到 Light，且切换只改变材质、排版语气与 token 映射，不改变结构角色。

#### Scenario: 用户切换到 Light
- **WHEN** 用户触发主题切换控件
- **THEN** 系统 SHALL 将当前主题切换为 Light，并立即以对应 token 集合更新界面材质、文字与边框表现

#### Scenario: 主题切换保持结构同构
- **WHEN** 用户在 Dark 与 Light 主题间切换
- **THEN** 侧栏宽度、顶部空间角色、主内容起始线、版心关系与壳层层次 SHALL 保持一致，不得因主题切换而改变页面结构角色

### Requirement: 恢复上次主题选择
系统 SHALL 持久化用户上次选择的主题，并在后续访问时优先恢复该选择。

#### Scenario: 刷新后恢复主题
- **WHEN** 用户此前已手动选择 Light 主题并刷新或重新打开应用
- **THEN** 系统 SHALL 恢复 Light 主题对应的设计系统 token 映射，而不是回退到默认 Dark

#### Scenario: 已保存偏好优先于默认值
- **WHEN** 本地已存在主题偏好
- **THEN** 系统 SHALL 优先使用已保存的主题偏好，而不是使用首次访问默认值

## ADDED Requirements

### Requirement: Dark surface 层级必须收敛为有限语义面
系统 SHALL 为 Dark 主题定义有限且具名的 surface contract，至少区分 base、shell、panel、inset、rule 与 accent surface 等语义层级，并禁止在实现中持续增加未命名的 dark 背景色。

#### Scenario: Dark surface 使用具名层级
- **WHEN** 系统渲染 dark sidebar、top bar、panel、内嵌输入区或表格单元
- **THEN** 这些区域 SHALL 映射到已命名的 dark surface token，而不是使用无语义的新黑色值

#### Scenario: 新增 dark 面板不发明新黑色
- **WHEN** 后续实现新增 dark 主题区块或组件
- **THEN** 开发 SHALL 复用既有 dark surface token；若现有 token 无法表达语义，必须先更新设计系统 contract，再修改实现

### Requirement: 主题切换动效必须是材质切换而非布局切换
系统 SHALL 将主题切换视为 token 与材质的切换，而不是页面布局重排。

#### Scenario: 切换时仅发生材质过渡
- **WHEN** 用户触发主题切换
- **THEN** 系统 MAY 对背景、边框、文字与强调色做轻量过渡，但 SHALL 不因主题切换改变主布局宽度、壳层层次或主要区块位置
