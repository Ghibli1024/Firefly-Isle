## 1. Locale foundation

- [x] 1.1 创建独立于 theme 的 locale provider / hook，并支持 `zh` / `en` 状态读取与切换
- [x] 1.2 为 locale 状态增加持久化恢复，确保刷新后保留用户上次语言选择
- [x] 1.3 在主题切换旁边增加语言切换按钮，并保持两者状态职责独立

## 2. Copy source migration

- [x] 2.1 建立统一语言字典模块，覆盖 app shell 与共享切换控件文案
- [x] 2.2 迁移登录页可见文案到语言真相源，移除双语拼接字符串
- [x] 2.3 迁移工作区可见文案到语言真相源，确保 zh / en 下都为单语输出
- [x] 2.4 迁移档案页可见文案到语言真相源，确保标题、标签、说明和按钮不再混语

## 3. Verification and documentation

- [x] 3.1 为 locale 切换与关键页面单语渲染补充测试
- [x] 3.2 更新相关 `CLAUDE.md` / L3 头部，说明 locale 真相源与按钮职责边界
- [x] 3.3 运行 `npm run build`
- [x] 3.4 运行 `npm run lint`
- [x] 3.5 运行 `npm run test`
- [x] 3.6 人工复核 dark/light + zh/en 四种组合下页面均无中英文混杂
