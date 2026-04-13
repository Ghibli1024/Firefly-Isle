## ADDED Requirements

### Requirement: PatientRecord 核心数据结构
系统 SHALL 定义 PatientRecord 接口，包含基本信息、初发区块、治疗线数组三个顶层字段，所有字段均为可选。

#### Scenario: 创建最小化 PatientRecord
- **WHEN** 系统初始化一条患者记录
- **THEN** 系统 SHALL 允许 `PatientRecord` 以最小可用形态存在；若记录尚未落库，`id` 可暂时缺失，其余字段均可缺失且不报错

#### Scenario: basicInfo 包含完整字段集
- **WHEN** 用户提供患者基本信息
- **THEN** 系统 SHALL 接受 gender、age、height、weight、tumorType、diagnosisDate、stage 七个可选字段，类型分别为 string/number/number/number/string/string/string

### Requirement: TreatmentLine 治疗线数据结构
系统 SHALL 定义 TreatmentLine 接口，`lineNumber` 为必填数字（1=一线，2=二线，以此类推）；`regimen` 在完整治疗线中应被支持，但在提取中间态或缺失字段待补全时可暂时缺失。

#### Scenario: 治疗线包含完整字段集
- **WHEN** 系统记录一条晚期治疗线
- **THEN** 系统 SHALL 接受 `lineNumber`、`startDate`、`endDate`、`regimen`、`biopsy`、`immunohistochemistry`、`geneticTest` 字段；其中 `regimen` 在最终完整治疗线中应有值，但在提取与追问阶段可先留空并由后续高亮/追问补全

#### Scenario: treatmentLines 仅用于晚期患者
- **WHEN** 患者为非晚期
- **THEN** treatmentLines 数组 SHALL 为空数组 `[]`，不得包含任何治疗线条目

### Requirement: 三种患者情况的区分逻辑
系统 SHALL 根据数据特征区分三种患者情况：非晚期、确诊即晚期、复发晚期。

#### Scenario: 非晚期患者
- **WHEN** PatientRecord.treatmentLines 为空且 initialOnset 存在
- **THEN** 系统 SHALL 将该患者识别为非晚期，仅渲染初发区块

#### Scenario: 确诊即晚期患者
- **WHEN** PatientRecord.treatmentLines 非空且 initialOnset 为 undefined
- **THEN** 系统 SHALL 将该患者识别为确诊即晚期，从一线治疗开始渲染

#### Scenario: 复发晚期患者
- **WHEN** PatientRecord.treatmentLines 非空且 initialOnset 存在
- **THEN** 系统 SHALL 将该患者识别为复发晚期，同时渲染初发区块与治疗线

### Requirement: initialOnset 初发区块字段
系统 SHALL 定义 initialOnset 可选区块，记录非晚期或复发晚期患者的初发信息。

#### Scenario: initialOnset 字段完整性
- **WHEN** 用户提供初发信息
- **THEN** 系统 SHALL 接受 triggerDate、treatment、immunohistochemistry、geneticTest 四个可选字段，全部为 string 类型
