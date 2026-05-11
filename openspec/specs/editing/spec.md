## Purpose

定义时间线表格字段编辑、自动保存、空白高亮、工作台预览布局与布局稳定性规则。
## Requirements
### Requirement: 点击字段进入编辑模式
系统 SHALL 支持用户点击表格中任意字段单元格，将其切换为可编辑的 input 或 textarea 控件。

#### Scenario: 点击触发编辑
- **WHEN** 用户点击时间线表格中的任意字段单元格
- **THEN** 系统 SHALL 将该单元格替换为对应类型的 input 控件，并自动聚焦（focus）

### Requirement: blur 后保存编辑结果
系统 SHALL 在编辑控件失去焦点（blur）时，立即将修改值保存到 PatientRecord 状态中，无需用户点击「保存」按钮。

#### Scenario: blur 触发自动保存
- **WHEN** 用户完成编辑后点击其他区域导致 input 失焦
- **THEN** 系统 SHALL 将新值写入对应的 PatientRecord 字段，并将单元格切换回展示模式

#### Scenario: 编辑值为空字符串时的处理
- **WHEN** 用户清空字段内容后触发 blur
- **THEN** 系统 SHALL 将对应字段设为 undefined，而非保存空字符串

### Requirement: 空白字段高亮提示
系统 SHALL 对 PatientRecord 中临床重要字段（tumorType、stage、regimen）的空值单元格应用高亮样式，提示用户补充。

#### Scenario: 空白关键字段高亮
- **WHEN** 渲染时间线表格且 tumorType、stage 或 regimen 为 undefined
- **THEN** 对应单元格 SHALL 显示明显的视觉提示（如虚线边框或浅色背景），区别于已填写字段

#### Scenario: 非关键空白字段不高亮
- **WHEN** height、weight 等非核心字段为 undefined
- **THEN** 对应单元格 SHALL 以普通空白样式渲染，不应用高亮

### Requirement: 编辑不影响表格布局
系统 SHALL 确保编辑模式下 input 控件不导致表格行高或列宽发生明显跳变。

#### Scenario: 编辑时布局稳定
- **WHEN** 单元格切换为 input 控件
- **THEN** 该行的高度和该列的宽度 SHALL 保持与展示模式一致，误差不超过 2px

### Requirement: 自然语言编辑复用字段编辑边界
系统 SHALL 允许自然语言修改指令复用现有 PatientFieldTarget 字段编辑边界，并与逐格编辑保持一致的保存语义。

#### Scenario: 自然语言修改进入同一字段边界
- **WHEN** 用户用自然语言修改已有 PatientRecord 字段
- **THEN** 系统 SHALL 将修改归一为 PatientFieldTarget 支持的字段目标
- **AND** 系统 SHALL 使用与逐格编辑相同的字段归一化和持久化逻辑保存修改

#### Scenario: 工作台预览字段可编辑边界
- **WHEN** 工作台预览渲染姓名、性别、年龄、身高、体重、肿瘤类型、分期、治疗方案、诊断日期、基因检测、免疫组化或临床备注
- **THEN** 对应字段 SHALL 通过 PatientFieldTarget 进入可编辑状态
- **AND** 工作台预览 SHALL 不渲染 BMI 编辑入口；BMI 由详情页根据身高体重自动计算展示
- **AND** 工作台预览 SHALL 不渲染独立“其他信息”格，其他信息 SHALL 收敛到临床备注

#### Scenario: 工作台预览最新检测摘要
- **WHEN** PatientRecord 包含多次 geneticTest 或 immunohistochemistry 结果
- **THEN** 工作台预览 SHALL 在基本信息区只展示最新一条“基因检测（最新）”与“免疫组化（最新）”结果
- **AND** 旧的检测结果 SHALL 在临床备注下方以既往检测历史形式展示

#### Scenario: 工作台预览基本信息与病程轨道布局
- **WHEN** 工作台预览渲染基本信息与治疗时间线
- **THEN** 诊断日期 SHALL 与肿瘤类型、分期同组展示，并位于治疗方案之前
- **AND** 治疗方案 SHALL 与最新基因检测、最新免疫组化同组展示
- **AND** 治疗时间线 SHALL 使用紧凑病程轨道展示初发治疗与治疗线顺序，不依赖横向滚动箭头 pill 串联

#### Scenario: 自然语言清空字段
- **WHEN** 用户明确要求删除或清空某个支持的字段
- **THEN** 系统 SHALL 将对应字段设为 undefined，而非保存空字符串
