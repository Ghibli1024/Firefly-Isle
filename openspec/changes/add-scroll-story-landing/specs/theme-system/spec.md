## ADDED Requirements

### Requirement: 滚动叙事章节共享双主题视觉语义
系统 SHALL 让登录页滚动叙事章节在 dark / light 主题间共享同一套设计 token、层级与动效语义。

#### Scenario: 叙事章节跟随主题切换
- **WHEN** 用户在 `/login` 切换主题
- **THEN** 全部叙事章节 SHALL 同步切换到对应主题 token
- **AND** 章节 SHALL NOT 出现仅单一主题可读的文字或仅单一主题存在的叙事元素
- **AND** 主题切换 SHALL NOT 重置当前滚动位置或叙事进度
