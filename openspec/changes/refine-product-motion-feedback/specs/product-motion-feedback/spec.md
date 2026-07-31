## ADDED Requirements

### Requirement: 生产动效不得改变 V3 视觉合同
系统 SHALL 在优化动效时继续使用当前 V3 生产视觉系统，并保持颜色、字体、圆角、布局、组件职责与信息架构不变。

#### Scenario: 正式页面消费动效优化
- **WHEN** 工作区、病历、只读分享或指标统计页面应用新的共享动效
- **THEN** 页面 SHALL 继续消费既有 V3 token 与组件几何
- **AND** 页面 SHALL NOT 消费 V4 评估主题或改变原有内容层级

### Requirement: 页面进入动效必须短促且可组合
系统 SHALL 将正式页面的 route reveal 与内容 stagger 定义为两个互不覆盖的层级，并仅使用 `transform` 与 `opacity` 表达进入状态。

#### Scenario: 路由根节点进入
- **WHEN** 正式产品路由首次渲染主内容
- **THEN** 路由根节点 SHALL 在不超过 360 ms 内从不超过 10 px 的垂直偏移恢复
- **AND** 动效 SHALL NOT 使用 blur
- **AND** 该节点 SHALL NOT 同时挂载 route reveal 与 stagger 两个设置 `animation` shorthand 的类

#### Scenario: 子内容交错进入
- **WHEN** 页面为多个同级内容块声明 stagger 顺序
- **THEN** 每个内容块 SHALL 在不超过 360 ms 内从不超过 8 px 的垂直偏移恢复
- **AND** 相邻顺序的延迟 SHALL 不超过 50 ms
- **AND** 内容块 SHALL NOT 因长期 `will-change` 保持独立合成层

### Requirement: 高频标签切换必须连续而不弹跳
系统 SHALL 通过既有选中边框与轻量颜色过渡表达标签选择，不得在每次鼠标或键盘选择时播放弹跳 keyframe，也不得为动效新增滑块几何。

#### Scenario: 病历视图标签切换
- **WHEN** 用户通过鼠标或键盘在档案、表格与甘特图之间切换
- **THEN** 选中边框与标签文字颜色 SHALL 在不超过 180 ms 内完成反馈
- **AND** 标签切换 SHALL 保持既有文字页签几何，不引入移动滑块或额外布局层
- **AND** 选中按钮 SHALL NOT 运行 overshoot、bounce 或 scale keyframe

### Requirement: 控件反馈必须区分鼠标悬停与真实按压
系统 SHALL 为可交互控件提供快速按压反馈，并限制悬停位移只在支持精细指针的设备生效。

#### Scenario: 可用控件按压
- **WHEN** 用户按下可用按钮或链接控件
- **THEN** 控件 SHALL 在不超过 160 ms 的过渡中轻微缩小至不低于 `scale(0.97)`
- **AND** 控件内部图标 SHALL 随父控件整体移动而不执行第二次 hover 位移

#### Scenario: 触摸设备与禁用控件
- **WHEN** 设备不支持 hover 或控件处于 `disabled` / `aria-disabled` 状态
- **THEN** 系统 SHALL NOT 应用鼠标 hover 位移
- **AND** 禁用控件 SHALL 保持静止

#### Scenario: 通用按钮过渡属性
- **WHEN** 系统渲染共享 `Button` 基元
- **THEN** 按钮 SHALL 只声明实际需要过渡的 transform、颜色、边框、阴影与透明度属性
- **AND** 按钮 SHALL NOT 使用 `transition-all`

### Requirement: 状态图标交换必须保持视觉连续性
系统 SHALL 以小幅缩放和透明度交叉淡化表达状态图标切换，而不是让图标从接近零尺寸出现。

#### Scenario: 提取按钮切换加载状态
- **WHEN** 提取按钮在静态图标与加载图标之间切换
- **THEN** 非活动图标的起始缩放 SHALL 不低于 `scale(0.92)`
- **AND** 图标切换 SHALL 在不超过 180 ms 内完成
- **AND** 图标交换 SHALL NOT 依赖 blur 或长期 `will-change`

### Requirement: 减少动态偏好必须保留完整静态内容
系统 SHALL 在 `prefers-reduced-motion: reduce` 下取消共享进入、标签、控件与状态交换动效，同时保留内容、状态和交互可理解性。

#### Scenario: 用户启用减少动态
- **WHEN** 浏览器报告 `prefers-reduced-motion: reduce`
- **THEN** route reveal、stagger、control press、tab switch 与 icon swap SHALL 不播放 animation 或 transition
- **AND** 相关内容 SHALL 以最终位置和可见状态呈现
- **AND** 登录滚动叙事 SHALL 继续遵守其既有静态降级与单一 WebGL 生命周期合同
