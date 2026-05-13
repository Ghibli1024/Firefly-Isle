## MODIFIED Requirements

### Requirement: 基本信息区块始终显示
系统 SHALL 在表格顶部始终渲染基本信息区块，包含 gender、age、tumorType、diagnosisDate、stage 等字段；当正式档案页提供极简表格视图时，该视图 SHALL 复用同一个 TimelineTable 渲染合同。

#### Scenario: 基本信息区块位置
- **WHEN** 渲染任意类型患者的时间线表格
- **THEN** 基本信息区块 SHALL 固定显示在表格最顶部，在初发区块和治疗线区块之前

#### Scenario: 真实记录进入极简表格视图
- **WHEN** 用户在真实 `/record/:id` 切换到极简表格视图
- **THEN** 页面 SHALL 使用当前 PatientRecord 渲染 `TimelineTable`
- **AND** 表格 SHALL 保持三类患者渲染规则和关键字段缺失高亮

## ADDED Requirements

### Requirement: 档案页提供极简 TimelineTable 视图
系统 SHALL 在 `/record/:id` 档案页提供可切换的一页极简 TimelineTable 视图。

#### Scenario: 用户切换到极简表格
- **WHEN** 用户点击极简表格视图
- **THEN** 页面 SHALL 从 dossier 或 Gantt 切换到 `TimelineTable`
- **AND** 切换 SHALL NOT 改变 PatientRecord 数据
- **AND** 页面 SHALL 保留编辑保存状态的单一来源

#### Scenario: demo 记录可预览表格
- **WHEN** 用户访问 `/record/demo` 并切换到极简表格
- **THEN** 页面 SHALL 使用 demo PatientRecord 渲染 `TimelineTable`
- **AND** 页面 SHALL NOT 写入 Supabase
