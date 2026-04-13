## ADDED Requirements

### Requirement: 主题实现必须来源于设计系统
系统 SHALL 将 `docs/design/dark/firefly_precision/DESIGN.md` 与 `docs/design/light/ink_archive/DESIGN.md` 作为 Dark / Light 主题 token、字体与视觉语言的直接来源，而不是使用组件库默认主题自由近似。

#### Scenario: Dark 主题对齐 dark 设计系统
- **WHEN** 系统渲染 Dark 主题
- **THEN** 颜色、字体、边框、圆角、层级与布局语气 SHALL 对齐 `docs/design/dark/firefly_precision/DESIGN.md` 与 `docs/design/dark/_{1,2,3}/code.html`

#### Scenario: Light 主题对齐 light 设计系统
- **WHEN** 系统渲染 Light 主题
- **THEN** 颜色、字体、边框、圆角、层级与布局语气 SHALL 对齐 `docs/design/light/ink_archive/DESIGN.md` 与 `docs/design/light/_{1,2,3}/code.html`

### Requirement: 默认主题为 Dark
系统 SHALL 在用户首次进入应用且不存在已保存主题偏好时使用 Dark 主题。

### Requirement: 支持手动切换为 Light
系统 SHALL 提供显式主题切换能力，允许用户在应用中从 Dark 切换到 Light。

#### Scenario: 用户切换到 Light
- **WHEN** 用户触发主题切换控件
- **THEN** 系统 SHALL 将当前主题切换为 Light，并立即更新界面样式

### Requirement: 恢复上次主题选择
系统 SHALL 持久化用户上次选择的主题，并在后续访问时优先恢复该选择。

#### Scenario: 刷新后恢复主题
- **WHEN** 用户此前已手动选择 Light 主题并刷新或重新打开应用
- **THEN** 系统 SHALL 恢复 Light 主题，而不是回退到默认 Dark

#### Scenario: 已保存偏好优先于默认值
- **WHEN** 本地已存在主题偏好
- **THEN** 系统 SHALL 优先使用已保存的主题偏好，而不是使用首次访问默认值
