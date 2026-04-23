## 1. Theme contract definition

- [x] 1.1 盘点 `src/` 中当前 dark / light 散写的颜色、边框、surface 与壳层结构，整理为待收口的设计系统输入清单
- [x] 1.2 定义主题 token 命名方案，覆盖 background、surface、text、rule、accent 与 motion 等核心语义层级
- [x] 1.3 定义 Theme Geometry Contract，固定侧栏宽度、顶部空间角色、主内容起始线、版心与分隔线语义
- [x] 1.4 定义 Dark Surface Contract，明确 base、shell、panel、inset、accent surface 与 rule 的允许取值和使用边界
- [x] 1.5 补一份面向协作者与 agent 的设计系统文档，说明设计证据源、token contract 与 component contract

## 2. Design system primitives

- [x] 2.1 在前端实现中抽离主题 token 真相源，让页面颜色与边框不再直接依赖散写 hex
- [x] 2.2 抽离壳层级系统组件或样式基元，覆盖 sidebar、top bar / masthead、panel、section header 与 action surface
- [x] 2.3 让 `src/index.css` 与相关主题入口消费统一 token，而不是继续承载页面级例外规则
- [x] 2.4 清理与 token / system component 冲突的旧样式和临时过渡类，避免新旧体系并存

## 3. App shell migration

- [x] 3.1 重构 `src/components/app-shell.tsx`，让 dark / light 壳层共享同一几何合同与组件接口
- [x] 3.2 统一 dark / light 侧栏宽度、顶部角色、主内容起始线与壳层分隔线语义
- [x] 3.3 收敛 dark sidebar、top bar、panel 与用户区的背景层级，消除未命名 dark 黑色漂移
- [x] 3.4 确保主题切换只改变 token 映射与材质表现，不触发布局跳变

## 4. Page adoption

- [x] 4.1 迁移工作区页面以消费新的壳层组件、surface token 与 action surface 规则
- [x] 4.2 迁移登录页以消费新的壳层合同，消除页面内重复主题结构语义
- [x] 4.3 迁移档案详情页以消费新的壳层合同和统一 surface 语义
- [x] 4.4 迁移 `TimelineTable` 相关 dark / light 表面层级，使其完全对齐新的 token contract

## 5. Verification and documentation sync

- [x] 5.1 对比 dark / light 主题切换前后，验证侧栏宽度、顶部角色、主区版心与报告容器不再发生结构跳变
- [x] 5.2 验证 dark 主题所有主要容器都来自命名 surface token，不再新增未定义黑色值
- [x] 5.3 运行并记录本轮相关验证（至少包括 `npm run build`、`npm run lint`、`npm run test`）
- [x] 5.4 若本轮调整涉及文件职责或目录结构变化，更新受影响的 CLAUDE.md 与 L3 头部契约
