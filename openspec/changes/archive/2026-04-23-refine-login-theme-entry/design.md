## Context

`unify-theme-system` 已经把主题 token 与 system components 建起来，但 `/login` 的两个主题仍保留了不该存在的例外：dark 借用了工作区侧栏，light 把主题切换塞进认证卡片 header，并把大面积背景做成点阵纹理；追加评论又指出 light 右侧竖排水印也是白色入口里的无意义装饰噪声。这些浏览器评论都落在同一个设计判断上：登录页不是工作区，主题切换也不是表单动作。

## Decisions

### 1. 登录页不承载工作区导航

- **Decision**: dark `/login` 去掉 `ArchiveSideNav`，也去掉依赖侧栏存在的 `sidebarOffsetClass`。
- **Rationale**: 未认证用户还没有进入工作区，展示“提取 / 病历 / 统计”会制造错误状态感。登录页只需要品牌、认证和全局 utility。
- **Trade-off**: dark 与工作区的强一致性会降低一点，但入口页语义更干净。

### 2. 主题切换属于页面级 utility

- **Decision**: light `/login` 的主题切换移出认证卡片标题行，放到右下角，视觉参考 dark 登录页当前的 icon button + vertical rule。
- **Rationale**: 主题切换作用于整个应用，不应被局部表单标题吞掉。右下角让它成为独立控制，且两个主题的空间身份一致。
- **Trade-off**: 小屏要避免遮挡表单底部动作；可以通过 `bottom` 间距与响应式位置处理。

### 3. light 登录页背景使用纯色 surface

- **Decision**: light `/login` 背景不再使用 `ff-light-login-bg` 点阵纹理，改为纯色 `surface.base`。
- **Rationale**: 登录页已有超大品牌字、粗线框、卡片阴影和表单信息，点阵背景增加噪声。纯色背景让报纸式排版更像纸面，而不是工程网格。
- **Trade-off**: 会少一点“设计稿装饰感”，但入口聚焦更强。

### 4. light 登录页移除竖排水印

- **Decision**: light `/login` 不再渲染右侧 `CONFIDENTIAL CLINICAL WORKFLOW ENVIRONMENT` 竖排水印。
- **Rationale**: 该文案不参与导航、认证、隐私或主题切换，只制造视觉噪声；移除后右下角主题切换成为唯一页面级 utility。
- **Trade-off**: 页面少一个 editorial 装饰，但入口信息层级更干净。

## Verification

- 通过组件回归测试确认登录页 markup 不再包含 dark 工作区侧栏文本。
- 通过组件回归测试确认 light 登录页不再使用点阵背景类。
- 通过组件回归测试确认 light 登录页不再渲染右侧竖排水印文案。
- 通过浏览器截图确认 light/dark 登录页在 976x933 与桌面宽度下主题切换位置、背景与布局符合评论意图。
