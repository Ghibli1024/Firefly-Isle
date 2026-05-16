## ADDED Requirements

### Requirement: Capacitor shell must wrap the existing web app
系统 SHALL 提供 iOS 与 Android Capacitor 外壳，使移动安装包加载现有 Vite/React 生产构建，而不是维护第二套产品 UI。

#### Scenario: Capacitor config points at the web build
- **WHEN** 开发者运行移动 sync 或原生构建
- **THEN** Capacitor config SHALL 使用稳定 app id、应用名和 `dist` webDir
- **AND** 原生壳 SHALL NOT 指向需要本地 dev server 才能运行的 URL

#### Scenario: Native shell preserves route grammar
- **WHEN** 用户从移动壳启动应用
- **THEN** 系统 SHALL 进入现有根路由、登录恢复、隐私门控或 Demo 入口
- **AND** 系统 SHALL NOT 创建 iOS/Android 专属业务页面

### Requirement: Native projects must be reproducible from repository commands
系统 SHALL 提供可重复的本地命令，让开发者能从 Web build 同步到 iOS/Android 平台工程。

#### Scenario: Web build precedes native sync
- **WHEN** 开发者准备刷新移动壳资源
- **THEN** workflow SHALL 先执行 Vite production build
- **AND** 再执行 Capacitor sync

#### Scenario: Platform projects are committed without secrets
- **WHEN** iOS/Android 平台工程进入仓库
- **THEN** 工程 SHALL 包含运行 shell 所需的公开配置
- **AND** 工程 SHALL NOT 包含 provisioning profiles、keystores、签名密码、Apple team secrets、Google Play 凭证或 derived build artifacts

### Requirement: Native shell must preserve privacy and data boundaries
系统 SHALL 保持 PWA baseline 的隐私、认证、离线和分享边界在 Capacitor WebView 中不变。

#### Scenario: Medical data stays server-truth based
- **WHEN** 用户在 Capacitor shell 中登录、OCR、AI 分析、保存病历、读取受保护记录或读取分享链接
- **THEN** 系统 SHALL 使用现有 Supabase / Edge Function / RLS 边界
- **AND** 系统 SHALL NOT 新增原生本地患者记录缓存作为真实数据源

#### Scenario: Offline behavior remains honest
- **WHEN** 设备离线或 WebView 网络不可用
- **THEN** 系统 SHALL 显示现有网络不可用提示
- **AND** 在线依赖动作 SHALL NOT 伪成功

#### Scenario: Share links remain read-only
- **WHEN** 访问者在 Capacitor shell 中打开 `/share/:code`
- **THEN** 系统 SHALL 保持只读单份记录语义
- **AND** 页面 SHALL NOT 提供编辑、保存、删除或访问其他记录的能力

### Requirement: Mobile shell verification must cover platform-sensitive flows
系统 SHALL 在移动壳发布前记录平台敏感链路的验证结果。

#### Scenario: Verification covers iOS and Android targets
- **WHEN** 准备交付 Capacitor shell
- **THEN** 验证 SHALL 覆盖 iOS Simulator、iOS 真机、Android Emulator 和 Android 真机中可用的目标
- **AND** 未能验证的目标 SHALL 记录为受限而非假装通过

#### Scenario: Verification covers existing product flows
- **WHEN** 执行移动壳验证
- **THEN** 验证 SHALL 覆盖冷启动、隐私门控、登录恢复、公开 Demo、`/app` 上传、`/record/:id`、`/analytics/:id`、`/share/:code`、AI/OCR 网络失败边界、PDF/PNG 导出和分享复制降级

### Requirement: Store release must remain out of scope
系统 SHALL 明确区分本地 Capacitor shell 与应用商店发布。

#### Scenario: Signing and store distribution are deferred
- **WHEN** 本 change 完成
- **THEN** 仓库 SHALL 具备本地移动壳工程和验证文档
- **AND** 系统 SHALL NOT 声称已完成 App Store、TestFlight、Google Play 或生产签名发布
