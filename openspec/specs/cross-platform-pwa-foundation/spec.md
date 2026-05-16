# cross-platform-pwa-foundation Specification

## Purpose
Define Firefly-Isle's Web-first cross-platform baseline: installable PWA metadata, privacy-first service worker caching, offline/weak-network truth boundaries, mobile safe-area/touch behavior, SPA deep-link recovery, and platform validation expectations before any native shell is introduced.

## Requirements
### Requirement: 应用必须可作为 PWA 安装
系统 SHALL 提供完整 PWA 安装元数据，使 Firefly-Isle 能在支持的桌面与移动浏览器中作为独立应用安装或添加到主屏幕。

#### Scenario: 浏览器发现 PWA manifest
- **WHEN** 用户访问已部署应用
- **THEN** 系统 SHALL 提供有效 Web App Manifest
- **AND** manifest SHALL 定义应用名称、短名称、启动 URL、scope、display mode、主题色、背景色与图标集合

#### Scenario: 图标满足安装要求
- **WHEN** 浏览器评估应用是否可安装
- **THEN** 系统 SHALL 提供至少一组普通图标和 maskable 图标
- **AND** 图标 SHALL 使用非敏感品牌资产
- **AND** 图标 SHALL NOT 从需要认证的路径加载

#### Scenario: installed PWA 启动进入统一路由
- **WHEN** 用户从已安装 PWA 图标启动应用
- **THEN** 系统 SHALL 进入现有根路由、登录恢复或 Demo 入口语法
- **AND** 系统 SHALL NOT 为 installed mode 创建独立业务路由

### Requirement: Service worker 必须采用隐私优先缓存边界
系统 SHALL 只缓存应用壳与非敏感静态资产，并禁止缓存患者数据、授权码、认证响应、OCR 响应、AI 响应或 Supabase 私有 API 响应。

#### Scenario: 静态应用壳被缓存
- **WHEN** 用户在线访问应用并完成初次资源加载
- **THEN** service worker SHALL 能缓存构建后的 HTML 壳、JS/CSS chunk、字体、manifest、图标和非敏感公共静态资源
- **AND** 后续弱网访问 SHALL 能复用这些静态资源加载基础页面壳

#### Scenario: 敏感动态响应不进入缓存
- **WHEN** 应用请求 Supabase Auth、Supabase REST、Supabase Edge Functions、Cloudflare Functions、LLM proxy、OCR、分享授权码或患者记录数据
- **THEN** service worker SHALL NOT 将响应写入 Cache Storage
- **AND** 这些请求 SHALL 以网络真实结果为准

#### Scenario: 缓存更新不破坏当前版本
- **WHEN** 新版本部署到 Cloudflare Pages
- **THEN** service worker SHALL 能获取新版静态资产
- **AND** 旧缓存 SHALL 被清理或替换
- **AND** 用户 SHALL NOT 长期停留在不可更新的旧构建中

### Requirement: 离线状态必须表达真实能力边界
系统 SHALL 在离线或弱网时提供可解释状态，并明确区分可打开的缓存页面壳与必须在线完成的医疗数据动作。

#### Scenario: 离线打开缓存壳
- **WHEN** 用户设备离线且已安装或已访问过 PWA
- **THEN** 系统 SHALL 尽力打开缓存的公共应用壳
- **AND** 页面 SHALL 显示当前网络不可用或连接受限状态

#### Scenario: 在线依赖动作离线时不伪成功
- **WHEN** 用户离线触发登录、注册、匿名会话、OCR、AI 分析、保存病历、读取受保护记录、读取分享链接或统计数据刷新
- **THEN** 系统 SHALL 显示需要网络连接的可读反馈
- **AND** 系统 SHALL NOT 伪造成功结果
- **AND** 系统 SHALL NOT 创建本地患者记录副本作为真实保存结果

#### Scenario: 弱网失败可重试
- **WHEN** 网络请求因为连接超时、离线或临时服务不可用失败
- **THEN** 系统 SHALL 提供可重试状态或恢复路径
- **AND** 错误反馈 SHALL NOT 暴露 token、授权码、原始 provider secret 或后端敏感错误

### Requirement: 移动与 installed shell 必须保持产品主链路可用
系统 SHALL 在移动浏览器和 installed PWA 模式下保持核心页面壳、导航、触控、safe-area 与深链路可用。

#### Scenario: 移动 safe-area 不遮挡核心操作
- **WHEN** 用户在 iOS 或 Android 移动浏览器、主屏幕 PWA 或浏览器 installed mode 中打开应用
- **THEN** 页面顶部、底部、侧栏恢复入口、主操作按钮和弹层操作 SHALL 避开系统 safe-area
- **AND** 核心操作 SHALL NOT 被地址栏、Home indicator、刘海区域或系统导航栏遮挡

#### Scenario: 触控目标适配移动端
- **WHEN** 用户在窄屏触控设备中使用登录、侧栏、主题、语言、音乐、上传、导出、分享或视图切换控件
- **THEN** 主要触控目标 SHALL 保持可稳定点击
- **AND** 文本 SHALL NOT 溢出控件或互相遮挡

#### Scenario: 深链路在 installed mode 中恢复
- **WHEN** 用户在 installed PWA 中打开 `/demo/record`、`/demo/analytics`、`/record/:id`、`/analytics/:id`、`/share/:code` 或 `/auth/callback`
- **THEN** Cloudflare Pages fallback 和 SPA 路由 SHALL 正确恢复目标页面
- **AND** 系统 SHALL NOT 因刷新或冷启动跳回错误入口

### Requirement: PWA 模式必须保留认证和分享语义
系统 SHALL 保持现有 Supabase Auth、匿名 session、OAuth callback、隐私门控、Demo 和只读分享语义在 PWA 模式下不变。

#### Scenario: OAuth callback 在 PWA 中恢复 session
- **WHEN** 用户从 installed PWA 或移动浏览器触发支持的 OAuth 登录并返回 `/auth/callback`
- **THEN** 系统 SHALL 通过现有 Supabase session 恢复路径进入应用
- **AND** 系统 SHALL NOT 丢弃 OAuth callback 参数

#### Scenario: 隐私门控不因 installed mode 被绕过
- **WHEN** 用户首次从 installed PWA 启动应用
- **THEN** 系统 SHALL 继续执行现有隐私条款门控
- **AND** 用户确认前 SHALL NOT 进入主功能

#### Scenario: 分享链接保持只读边界
- **WHEN** 访问者在移动浏览器或 installed PWA 中打开 `/share/:code`
- **THEN** 系统 SHALL 保持只读单份记录访问语义
- **AND** 页面 SHALL NOT 提供编辑、保存、删除或访问同账户其他记录的能力

#### Scenario: Demo 不要求安装或登录
- **WHEN** 用户在移动浏览器、桌面浏览器或 installed PWA 中打开公开 `/demo/*` 路由
- **THEN** 系统 SHALL 展示公开 Demo
- **AND** 系统 SHALL NOT 要求 Supabase session 才能查看 Demo

### Requirement: PWA 模式必须验证上传与导出行为
系统 SHALL 保持文件上传、OCR 文本确认、PDF/PNG 导出和分享复制在 PWA 模式下可用，并在浏览器能力不足时提供可读降级。

#### Scenario: 文件上传进入现有 OCR 流程
- **WHEN** 用户在移动浏览器或 installed PWA 的 `/app` 中上传受支持的图片或 PDF
- **THEN** 系统 SHALL 进入现有 OCR 与结构化确认流程
- **AND** 系统 SHALL NOT 要求原生文件选择插件才能完成 Web 上传

#### Scenario: PDF 和 PNG 导出可完成或可解释失败
- **WHEN** 用户在 PWA 模式的真实 `/record/:id` dossier 中触发 PDF 或 PNG 导出
- **THEN** 系统 SHALL 尝试使用现有浏览器导出链路生成文件
- **AND** 当浏览器禁止下载或渲染失败时，系统 SHALL 显示可读失败反馈
- **AND** 系统 SHALL NOT 静默失败

#### Scenario: 复制和系统分享具备降级路径
- **WHEN** 用户在 PWA 模式中复制分享链接或触发可用的系统分享能力
- **THEN** 系统 SHALL 使用浏览器支持的 clipboard 或 share API
- **AND** 当能力不可用时，系统 SHALL 提供可读的手动复制路径

### Requirement: 发布前必须完成跨平台验证矩阵
系统 SHALL 在发布 PWA foundation 前完成与当前产品能力直接相关的平台验证。

#### Scenario: 验证目标覆盖主流平台
- **WHEN** 准备发布 PWA foundation
- **THEN** 验证 SHALL 覆盖桌面 Chromium、桌面 Safari、iOS Safari、iOS 主屏幕 PWA、Android Chrome 和 Android installed PWA
- **AND** 验证结果 SHALL 记录已通过、受限或失败的能力

#### Scenario: 验证主链路覆盖现有能力
- **WHEN** 执行 PWA foundation 验证
- **THEN** 验证 SHALL 覆盖安装发现、冷启动、刷新深链路、隐私门控、登录恢复、Demo、真实 `/app`、`/record/:id`、`/analytics/:id`、`/share/:code`、上传 OCR、AI 分析失败/成功边界和 PDF/PNG 导出

#### Scenario: 缓存隐私边界被验证
- **WHEN** 执行 PWA foundation 验证
- **THEN** 验证 SHALL 检查 Cache Storage 中不存在患者记录、授权码、Supabase Auth 响应、Edge Function 响应、LLM 响应或 OCR 响应
- **AND** 验证 SHALL 检查静态资源缓存不阻止新版本更新
