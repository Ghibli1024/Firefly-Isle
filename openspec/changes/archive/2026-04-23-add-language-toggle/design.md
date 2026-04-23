## Context

当前代码中的可见文案散落在登录页、工作区、档案页、导航与主题切换等多个组件里，且大量以硬编码形式直接写在 JSX 中。现状不是“缺少一个语言按钮”这么简单，而是没有独立的语言状态与统一文案真相源，导致同一页面内长期存在中文、英文和双语拼接字符串并存的问题。主题系统已经稳定，语言切换必须作为平行于 theme 的全局状态存在，而不是继续把语言判断塞进 dark/light 分支里。

## Goals / Non-Goals

**Goals:**
- 建立独立于 theme 的全局 locale 状态，至少支持 `zh` 与 `en`。
- 在主题切换旁边提供语言切换按钮，让用户能在任意主题下切换语言。
- 为登录页、工作区、档案页与共享壳层建立统一文案真相源。
- 保证当前 locale 下页面只渲染该语言，不允许组件内继续保留 `中文 / English` 混合字符串。
- 让后续页面新增文案时有明确入口，避免继续把文案写回散落的 JSX。

**Non-Goals:**
- 不引入完整第三方 i18n 平台或远程翻译服务。
- 不改变现有路由、主题 token、认证、提取、导出与数据持久化逻辑。
- 不在本轮解决多语言排版润色之外的品牌文案重写问题。
- 不扩展到中文、英文之外的第三语言。

## Decisions

### 1. 语言状态作为独立全局 provider，而不是挂在 theme 模块下
- **Decision**: 新增独立的 locale context / provider，并提供 `useLocale()` 接口给壳层和页面消费。
- **Rationale**: 主题与语言属于两个正交维度。把 locale 塞进 theme 会制造错误耦合，让后续维护者误以为语言是视觉主题的附属属性。
- **Alternatives considered**:
  - 复用现有 theme provider 增加 locale 字段：实现快，但职责污染明显。
  - 只在页面 props 里逐层透传 locale：会迅速产生 prop drilling，并让壳层按钮难以复用。

### 2. 使用本地集中式字典，而不是保留页面内硬编码文案
- **Decision**: 建立本地字典模块，按页面/模块组织 `zh` 与 `en` 文案，由组件通过 key 读取。
- **Rationale**: 当前真正的问题是文案真相源缺失。先把字典收口，比引入重量级框架更符合当前项目规模。
- **Alternatives considered**:
  - 继续在组件里写条件表达式：短期能跑，但会持续制造混杂与重复。
  - 直接接入第三方 i18n 库：对当前规模偏重，且会把本轮聚焦从“消除混杂”扩展成框架迁移。

### 3. 先覆盖所有现有可见文案入口，再考虑抽象更复杂的插值机制
- **Decision**: 第一轮优先覆盖登录页、workspace、record、theme toggle、app shell 导航与头部文案；动态标签使用最直接的 key/value 插值方案。
- **Rationale**: 用户当前痛点是“屏幕上能看到的文案混杂”。先把可见面全部收口，比提前设计复杂国际化语法更重要。
- **Alternatives considered**:
  - 只改最显眼标题：改动小，但无法满足“不出现中英文混杂”的硬约束。
  - 一次性抽象完整 message-format 系统：过度工程，超出当前需求。

### 4. 语言切换入口与主题切换并列，但职责分离
- **Decision**: 在现有 theme toggle 旁边新增 locale toggle，二者在壳层上并列呈现，但共享的只是布局位置，不共享状态实现。
- **Rationale**: 用户已明确要求按钮靠近主题切换；但靠近是 UI 关系，不是状态耦合关系。
- **Alternatives considered**:
  - 把语言切换塞进设置菜单：会增加交互深度，不符合当前直接切换诉求。
  - 用同一个按钮循环切 theme + locale：语义混乱，违反职责单一。

## Risks / Trade-offs

- **[Risk] 首轮迁移遗漏零散英文 token，导致仍有混杂残留** → **Mitigation**: 以页面为单位系统扫描并人工复核所有可见文案，不只改标题。**
- **[Risk] 文案 key 组织过碎，导致字典难维护** → **Mitigation**: 先按页面/壳层模块分组，避免过早做全局扁平化。**
- **[Risk] 动态字符串插值处理不一致** → **Mitigation**: 限制首轮动态文案格式，优先使用简单模板函数处理 `recordId`、计数等变量。**
- **[Risk] 未来新增页面又回到硬编码文案** → **Mitigation**: 在 specs 中明确“可见文案必须经语言真相源渲染”，把这件事立成约束而不是约定。**

## Migration Plan

1. 建立 locale provider、持久化策略与 `useLocale()` 消费接口。
2. 在壳层中增加语言切换按钮，并与 theme toggle 并列布局。
3. 建立本地字典模块，先覆盖 app shell、login、workspace、record。
4. 逐页替换 JSX 中的硬编码可见文案与双语拼接字符串。
5. 验证 dark/light 与 zh/en 四种组合下均只显示单语文案。
6. 补测试与文档，固化后续新增文案的接入方式。

## Open Questions

- 语言偏好是否与主题一样写入 localStorage，还是后续与用户 profile 同步？
- record/workspace 页面里一些缩写型临床术语（如 IHC、PD、EGFR）是否作为跨语言共用术语保留原样？
- 是否需要为 English 模式重写部分品牌性标题文案，还是先做直译与术语统一即可？
