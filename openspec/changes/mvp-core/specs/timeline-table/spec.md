## ADDED Requirements

### Requirement: 非晚期患者渲染规则
系统 SHALL 对非晚期患者仅渲染初发区块，不显示治疗线区块。

#### Scenario: 非晚期患者表格结构
- **WHEN** PatientRecord.treatmentLines 为空数组且 initialOnset 存在
- **THEN** 系统 SHALL 渲染包含基本信息行和初发区块行的表格，不出现任何治疗线行

### Requirement: 确诊即晚期患者渲染规则
系统 SHALL 对确诊即晚期患者从一线治疗开始渲染，不显示初发区块。

#### Scenario: 确诊即晚期患者表格结构
- **WHEN** PatientRecord.treatmentLines 非空且 initialOnset 为 undefined
- **THEN** 系统 SHALL 从第一条 TreatmentLine 开始渲染，每条治疗线占独立行，包含 regimen、startDate、endDate、biopsy、immunohistochemistry、geneticTest 字段

### Requirement: 复发晚期患者渲染规则
系统 SHALL 对复发晚期患者同时渲染初发区块与全部治疗线，初发区块在上，治疗线按 lineNumber 升序排列在下。

#### Scenario: 复发晚期患者表格结构
- **WHEN** PatientRecord.treatmentLines 非空且 initialOnset 存在
- **THEN** 系统 SHALL 先渲染初发区块行，再按 lineNumber 升序渲染各治疗线行

### Requirement: 免疫组化与基因检测随每线显示
系统 SHALL 在每条治疗线行内展示该线对应的 immunohistochemistry 和 geneticTest，在初发区块中同样展示初发时的对应字段。

#### Scenario: 治疗线内嵌检测信息
- **WHEN** TreatmentLine.immunohistochemistry 或 TreatmentLine.geneticTest 有值
- **THEN** 系统 SHALL 在该治疗线行内显示对应检测结果，不得合并到其他行

### Requirement: 空字段留白不报错
系统 SHALL 对所有 undefined 或空字符串字段渲染为空白单元格，不得显示「undefined」、「null」或任何错误信息。

#### Scenario: 空字段渲染
- **WHEN** 任意 PatientRecord 字段为 undefined 或空字符串
- **THEN** 系统 SHALL 渲染为空白单元格，页面不抛出 JavaScript 异常

### Requirement: 基本信息区块始终显示
系统 SHALL 在表格顶部始终渲染基本信息区块，包含 gender、age、tumorType、diagnosisDate、stage 等字段。

#### Scenario: 基本信息区块位置
- **WHEN** 渲染任意类型患者的时间线表格
- **THEN** 基本信息区块 SHALL 固定显示在表格最顶部，在初发区块和治疗线区块之前
