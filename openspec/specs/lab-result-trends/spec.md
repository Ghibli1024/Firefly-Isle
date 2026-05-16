# lab-result-trends Specification

## Purpose
TBD - created by archiving change add-lab-result-trends. Update Purpose after archive.
## Requirements
### Requirement: Lab readings use an independent patient-associated model
The system SHALL model laboratory indicators as patient-associated lab readings independent from treatment lines.

#### Scenario: OCR-derived lab reading enters lab structure
- **WHEN** an OCR-confirmed extraction produces blood routine, blood biochemistry, or tumor-marker readings
- **THEN** the system SHALL store those readings in the lab-result structure
- **AND** the system SHALL NOT embed those readings inside `treatmentLines`

#### Scenario: Manual or test lab reading enters lab structure
- **WHEN** a manual entry path or test fixture provides a lab reading
- **THEN** the system SHALL use the same lab-result structure as OCR-derived readings

### Requirement: Reference ranges come from a single source
The system SHALL evaluate abnormal lab readings using explicit row reference ranges or a centralized default reference-range table.

#### Scenario: Reading has explicit reference range
- **WHEN** a lab reading includes `referenceLow` or `referenceHigh`
- **THEN** the system SHALL evaluate abnormality from that row-specific range before considering defaults

#### Scenario: Reading lacks reference range
- **WHEN** a lab reading lacks both row-specific and default reference ranges
- **THEN** the system SHALL render the reading as requiring a reference range
- **AND** the system SHALL NOT classify it as abnormal

### Requirement: Trend classification highlights persistent elevation without diagnosis
The system SHALL classify persistent abnormal elevation as an informational trend warning only.

#### Scenario: Normal values
- **WHEN** all dated readings for an indicator are within the active reference range
- **THEN** the trend table SHALL render the indicator as normal

#### Scenario: Single abnormal high value
- **WHEN** exactly one latest dated reading for an indicator is above the active upper reference range
- **THEN** the trend table SHALL render the value as high
- **AND** the system SHALL NOT mark it as persistent elevation

#### Scenario: Consecutive abnormal high values
- **WHEN** the latest consecutive dated readings for an indicator contain at least two values above the active upper reference range
- **THEN** the trend table SHALL highlight persistent abnormal elevation
- **AND** the system SHALL NOT output a diagnosis or treatment instruction

#### Scenario: Missing date
- **WHEN** a lab reading has no test date
- **THEN** the trend table SHALL display the reading
- **AND** persistent-elevation classification SHALL ignore that undated reading

### Requirement: Record page displays lab trends
The system SHALL display laboratory trend data on `/record/:id` when lab readings exist for the current patient record.

#### Scenario: Trend table renders readings
- **WHEN** a record has one or more lab readings
- **THEN** `/record/:id` SHALL render a lab trend table grouped by indicator
- **AND** the table SHALL include latest value, unit, reference range, latest date, and trend status

#### Scenario: Record has no lab readings
- **WHEN** a record has no lab readings
- **THEN** `/record/:id` SHALL keep the existing record experience available
- **AND** the page SHALL NOT fail or invent lab data

### Requirement: 趋势工具提供按分类的最近异常汇总
系统 SHALL 按实验室分类从已保存实验室读数中计算最近异常汇总。

#### Scenario: 分类最近日期存在异常读数
- **WHEN** 某分类存在带最近检查日期的已保存读数，并且该日期至少一条读数超出有效参考范围
- **THEN** 趋势工具 SHALL 返回该分类的异常读数
- **AND** 每个结果 SHALL 包含指标编码、指标名称、数值、单位、参考范围、检查日期和偏高 / 偏低状态

#### Scenario: 分类最近日期存在缺参考范围读数
- **WHEN** 最近分类日期上的某条读数缺少显式参考范围和默认参考范围
- **THEN** 趋势工具 SHALL 将该读数标记为缺少参考范围
- **AND** 该读数 SHALL NOT 被计入偏高或偏低

### Requirement: 趋势工具检测肿瘤标志物连续百分比上涨
系统 SHALL 检测最近两个相邻区间涨幅均大于 20% 的肿瘤标志物。

#### Scenario: 肿瘤标志物存在两段连续上涨
- **WHEN** 某肿瘤标志物指标至少有三个按时间排序的有效读数
- **AND** 倒数第三个到倒数第二个读数的涨幅大于 20%
- **AND** 倒数第二个到最新读数的涨幅大于 20%
- **THEN** 趋势工具 SHALL 返回该指标的肿瘤标志物上涨提醒

#### Scenario: 前值不是正数
- **WHEN** 某个肿瘤标志物区间的前值小于或等于零
- **THEN** 趋势工具 SHALL 忽略该区间的百分比上涨检测
- **AND** 工具 SHALL NOT 除以零或编造百分比

#### Scenario: 非肿瘤标志物上涨
- **WHEN** 某个血常规或血生化指标连续两段上涨超过 20%
- **THEN** 趋势工具 SHALL NOT 为该指标返回肿瘤标志物上涨提醒

### Requirement: 趋势工具输出图表可用序列
系统 SHALL 输出按时间排序的序列数据，用于渲染网页端趋势图和等价表格。

#### Scenario: 指标有带日期读数
- **WHEN** 系统为某一个指标构建序列
- **THEN** 序列 SHALL 只包含带日期读数，并按时间升序排序
- **AND** 每个点 SHALL 包含日期、数值、单位、参考范围和状态

#### Scenario: 指标有无日期读数
- **WHEN** 某个指标包含无日期读数
- **THEN** 图表可用序列 SHALL 从折线图中排除这些无日期读数
- **AND** 表格元数据 SHALL 暴露无日期读数数量以供复核
