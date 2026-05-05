# src/components/login/
> L2 | 父级: /src/components/CLAUDE.md

成员清单
CLAUDE.md: 说明登录展示层内部拆分与公共 facade 边界，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
types.ts: 登录展示层类型边界，定义 AuthMode、AuthMethod、AuthFeedback、LoginPageViewProps 与内部 V3LoginProps，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
skins.ts: 登录入口与认证卡视觉材料表，集中主题 token、背景资产和场景图片路径，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
auth-copy.ts: 认证模式文案选择器，从共享 copy 真相源派生登录、注册、重置密码标题与动作文案，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
auth-card.tsx: 认证卡主体，渲染邮箱/手机 tabs、Google、微信占位、匿名会话、隐私入口与反馈态，不触碰 Supabase，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
auth-overlay.tsx: 统一登录弹层容器，编排 AuthCard、关闭动画、Esc 关闭和背景点击关闭，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
login-entry-view.tsx: 登录页入口编排层，渲染双主题全屏背景、工具区、安全状态、CTA 与认证弹层入口，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
login-trace-map.tsx: 登录页双主题海岸背景模块，保留干净铺底与线性氛围遮罩，不承载业务操作，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: facade 对外稳定，内部按文案、视觉材料、弹层、卡片和入口布局拆分；展示层不直接拥有认证状态机。
