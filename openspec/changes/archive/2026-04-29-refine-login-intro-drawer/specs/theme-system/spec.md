## MODIFIED Requirements

### Requirement: V3 色彩语义必须保持一致
系统 SHALL 将橙色作为唯一主要行动/焦点/风险色，将绿色仅用于系统健康、完成或通过状态，不得在 Light 主题中以黑色作为主要行动色；登录页的项目介绍与统一登录弹层 SHALL 通过橙色 CTA 与同一几何语法表达同一入口流程。

#### Scenario: 登录页使用橙色行动连接介绍页与登录弹层
- **WHEN** 系统渲染桌面 `/login`
- **THEN** 页面 SHALL 使用橙色登录 CTA 表达从能力介绍到身份访问的路径
- **AND** 页面 MAY 使用橙色节点或焦点状态强化真实结构节点、能力节点或身份访问 CTA
- **AND** 页面 SHALL NOT 使用无语义的随机橙色装饰点替代结构连接

#### Scenario: 登录页默认态使用全屏双主题扁平背景
- **WHEN** 系统渲染桌面 `/login` 默认态
- **THEN** 页面 SHALL 在暗色主题使用无灯塔蓝眼泪夜海与萤火虫光点背景，在亮色主题使用平潭风车白昼海岸背景
- **AND** 页面 SHALL 将品牌文案与 `登录` CTA 整合为一张全屏视觉
- **AND** 页面 SHALL NOT 将默认 intro 包裹在独立圆角卡片或外层 framed panel 中
- **AND** 页面 SHALL 使用适合全屏铺底的高清无文字背景资产，避免低分辨率裁切图在桌面端发糊
- **AND** 页面 SHALL NOT 额外覆盖经纬线、角度数值、罗盘刻度或航线 SVG
- **AND** 页面 SHALL NOT 额外渲染 `混乱`、`整理`、`结构化`、`可追溯` 四个 waypoint 或说明弹窗
- **AND** 页面 SHALL 在主 CTA 附近提供轻量安全状态，而不是大型运行状态卡片或悬浮角落状态

#### Scenario: 绿色仅用于登录页系统状态
- **WHEN** 登录页渲染 `OPERATIONAL`、安全通道或完成状态
- **THEN** 这些状态 MAY 使用绿色状态 token
- **AND** 登录主按钮和身份访问 CTA SHALL 使用橙色行动 token

### Requirement: V3 形状与层级必须来自组件语义
系统 SHALL 使用 V3 的 8px 主圆角、1px 结构边界与 2px 橙色焦点线表达层级，不得通过全局 `border-radius: 0 !important` 或厚阴影抹除组件语义；登录页介绍区与统一登录弹层 SHALL 共享同一几何合同。

#### Scenario: 登录弹层与介绍页共享材质
- **WHEN** `/login` 同时展示项目介绍页与统一登录弹层
- **THEN** 二者 SHALL 使用兼容的 surface、边框、圆角、字体层级与强调色
- **AND** Light 主题中的身份访问卡 SHALL 使用白色卡片 surface、浅色输入框、浅色次级按钮与花路灯塔白昼 hero
- **AND** Dark 主题中的身份访问卡 MAY 保留夜航 hero 与暗色 surface
- **AND** 登录弹层 SHALL NOT 看起来像与介绍页无关的独立海报

#### Scenario: 身份访问卡使用参考图式登录顺序
- **WHEN** 用户打开 `/login` 的统一登录弹层
- **THEN** 身份访问卡 SHALL 先展示灯塔路径 hero、`登录` 标题与 `此程虽艰，您永不踽踽独行。` 辅助文案
- **AND** 表单 SHALL 按邮箱、密码、记住我/忘记密码、社交登录、橙色登录按钮、`或` 分隔、匿名会话的顺序呈现
- **AND** 注册/返回登录入口 SHALL 降级为卡片底部辅助文本，不得重新成为顶部 tab 或主视觉
- **AND** 主题切换与语言切换 SHALL 留在项目介绍页工具区，不得回到身份访问卡内部

#### Scenario: 动画表达弹层状态
- **WHEN** 用户触发统一登录弹层展开
- **THEN** 页面 MAY 使用轻量遮罩、模糊、透明度或 CTA 焦点变化表达状态变化
- **AND** 动画 SHALL 保持可读性，不得遮挡表单字段或主要登录动作
- **AND** 页面 SHOULD 支持 reduced-motion 用户不依赖动画完成登录
