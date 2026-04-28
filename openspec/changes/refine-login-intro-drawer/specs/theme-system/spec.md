## MODIFIED Requirements

### Requirement: V3 色彩语义必须保持一致
系统 SHALL 将橙色作为唯一主要行动/焦点/风险色，将绿色仅用于系统健康、完成或通过状态，不得在 Light 主题中以黑色作为主要行动色；登录页的项目介绍与身份访问抽屉 SHALL 通过橙色光路表达同一入口流程。

#### Scenario: 登录页使用橙色光路连接介绍页与抽屉
- **WHEN** 系统渲染桌面 `/login`
- **THEN** 页面 MAY 使用橙色光路、节点或连接点表达从能力介绍到身份访问的路径
- **AND** 橙色光路 SHALL 指向真实结构节点、能力节点或身份访问 CTA
- **AND** 页面 SHALL NOT 使用无语义的随机橙色装饰点替代结构连接

#### Scenario: 绿色仅用于登录页系统状态
- **WHEN** 登录页渲染 `OPERATIONAL`、安全通道或完成状态
- **THEN** 这些状态 MAY 使用绿色状态 token
- **AND** 登录主按钮和身份访问 CTA SHALL 使用橙色行动 token

### Requirement: V3 形状与层级必须来自组件语义
系统 SHALL 使用 V3 的 8px 主圆角、1px 结构边界与 2px 橙色焦点线表达层级，不得通过全局 `border-radius: 0 !important` 或厚阴影抹除组件语义；登录页介绍区、航标节点与身份访问抽屉 SHALL 共享同一几何合同。

#### Scenario: 四个能力项以航标节点呈现
- **WHEN** 登录页展示 `结构化提取`、`时间线推理`、`临床数据保护`、`可审计追溯`
- **THEN** 页面 SHALL 将它们作为能力路径节点呈现
- **AND** 页面 SHALL NOT 将它们呈现为彼此孤立、同等重量的大型营销卡片
- **AND** 每个节点 SHALL 包含编号或顺序感、图标、标题与简短说明

#### Scenario: 登录抽屉与介绍页共享材质
- **WHEN** 桌面 `/login` 同时展示项目介绍页与身份访问抽屉
- **THEN** 二者 SHALL 使用兼容的暗色 surface、边框、圆角、字体层级与强调色
- **AND** 身份访问抽屉 SHALL NOT 看起来像与左侧介绍页无关的独立海报

#### Scenario: 动画表达空间让位
- **WHEN** 用户触发身份访问抽屉展开
- **THEN** 页面 MAY 使用轻量位移、宽度让位、透明度或光路亮起表达状态变化
- **AND** 动画 SHALL 保持可读性，不得遮挡表单字段或主要登录动作
- **AND** 页面 SHOULD 支持 reduced-motion 用户不依赖动画完成登录
