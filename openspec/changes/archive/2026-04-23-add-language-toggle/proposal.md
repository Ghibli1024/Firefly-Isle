## Why

当前界面文案同时混入中文、英文和双语拼接字符串，导致主题切换后页面仍然存在语言噪声，用户无法获得一致的单语阅读体验。现在需要把“语言”从“主题”中解耦出来，建立独立的中英文切换能力，让中文模式只显示中文、英文模式只显示英文，并为后续页面扩展提供统一文案真相源。

## What Changes

- 新增独立的中英文语言切换能力，并在主题切换控件旁边提供语言按钮。
- 建立统一的语言真相源与全局语言状态，让可见文案按当前语言单一路径渲染。
- 覆盖登录页、工作区、档案页与共享壳层中的可见文案，移除组件内直接拼接的双语字符串。
- 保持现有 dark / light 主题系统不变，禁止把语言逻辑耦合进主题状态。
- 为语言切换后的页面行为补充规范，明确“不允许中英文混杂显示”这一产品约束。

## Capabilities

### New Capabilities
- `locale-toggle`: 提供全局中英文状态、语言切换入口与统一文案真相源。

### Modified Capabilities
- `app-shell`: 页面壳层与三类核心页面的可见文案需要根据当前语言单独渲染，且语言切换与主题切换并列存在但职责独立。

## Impact

- Affected code:
  - `src/components/theme-toggle.tsx`
  - shared app shell / top bar / masthead / navigation components
  - `src/components/login-page-view.tsx`
  - `src/components/workspace/**`
  - `src/routes/workspace-page.tsx`
  - `src/components/record/**`
  - `src/routes/record-page.tsx`
  - new locale state / copy dictionary module(s)
- Unchanged core contracts:
  - existing dark / light theme token system
  - current routing structure
  - extraction, editing, export, auth, and persistence behavior
- No backend, auth, database, or API contract changes are expected.
