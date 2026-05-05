## MODIFIED Requirements

### Requirement: PatientRecord 核心数据结构
系统 SHALL 定义 PatientRecord 接口，包含基本信息、初发区块、治疗线数组以及可选的独立实验室指标集合；除 `treatmentLines` 外所有字段均为可选。

#### Scenario: 创建最小化 PatientRecord
- **WHEN** 系统初始化一条患者记录
- **THEN** 系统 SHALL 允许 `PatientRecord` 以最小可用形态存在；若记录尚未落库，`id` 可暂时缺失，其余字段均可缺失且不报错

#### Scenario: basicInfo 包含完整字段集
- **WHEN** 用户提供患者基本信息
- **THEN** 系统 SHALL 接受 gender、age、height、weight、tumorType、diagnosisDate、stage 七个可选字段，类型分别为 string/number/number/number/string/string/string

#### Scenario: labResults 保持独立
- **WHEN** 用户提供实验室指标记录
- **THEN** 系统 SHALL 接受可选 `labResults` 集合承载多次实验室指标读数
- **AND** 系统 SHALL 保持 `treatmentLines` 仅承载治疗线数据，不把实验室指标塞入治疗线字段
