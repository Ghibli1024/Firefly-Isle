## MODIFIED Requirements

### Requirement: 主题实现必须来源于设计系统
系统 SHALL 将 `docs/design/dark/firefly_precision/DESIGN.md` 与 `docs/design/light/ink_archive/DESIGN.md` 作为 Dark / Light 主题 token、字体与视觉语言的直接来源，并允许将用户浏览器评论中确认的噪声收敛为新的登录页主题合同。

#### Scenario: Light 登录页使用纯色入口背景
- **WHEN** 系统渲染 `/login` 的 Light 主题
- **THEN** 页面主背景 SHALL 使用纯色 `surface.base`
- **AND** 页面主背景 SHALL NOT 使用点阵纹理或重复网格纹理
- **AND** 页面 SHALL NOT 渲染右侧竖排水印文案

#### Scenario: Light 主题切换参考 Dark 主题入口位置
- **WHEN** 系统渲染 `/login` 的 Light 主题
- **THEN** 主题切换控件 SHALL 参考 Dark 登录页的右下角独立控制位置
- **AND** 控件视觉 SHALL 使用 Light 主题 token，而不是照搬 Dark 颜色
