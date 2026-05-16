# lab-report-ingestion Specification

## Purpose
TBD - created by archiving change add-lab-analytics-page. Update Purpose after archive.
## Requirements
### Requirement: 网页端实验室报告摄入通过 /app 输入区发起
系统 SHALL 允许已认证用户在 `/app` 输入区上传血常规、血生化和肿瘤标志物报告图片或 PDF。

#### Scenario: 用户开始血常规摄入
- **WHEN** 用户在 `/app` 输入区开始上传血常规报告
- **THEN** 系统 SHALL 将该上传视为血常规摄入
- **AND** 保存前的结构化读数 SHALL 使用血常规字典

#### Scenario: 用户开始血生化摄入
- **WHEN** 用户在 `/app` 输入区开始上传血生化报告
- **THEN** 系统 SHALL 将该上传视为血生化摄入
- **AND** 保存前的结构化读数 SHALL 使用血生化字典

#### Scenario: 用户开始肿瘤标志物摄入
- **WHEN** 用户在 `/app` 输入区开始上传肿瘤标志物报告
- **THEN** 系统 SHALL 将该上传视为肿瘤标志物摄入
- **AND** 保存前的结构化读数 SHALL 使用肿瘤标志物字典

### Requirement: OCR 输出持久化前必须结构化确认
系统 SHALL 在写入 Supabase 前，把识别出的实验室读数展示在可编辑确认状态中。

#### Scenario: OCR 返回候选读数
- **WHEN** OCR 和结构化提取返回候选实验室读数
- **THEN** 页面 SHALL 展示确认表格，包含指标名称、数值、单位、参考范围、检查日期和状态预览
- **AND** 用户确认前，系统 SHALL NOT 持久化这些读数

#### Scenario: 用户修正候选读数
- **WHEN** 用户在确认前编辑候选数值、单位、日期、指标映射或参考范围
- **THEN** 修正后的值 SHALL 成为保存到 Supabase 的值
- **AND** 原始 OCR 文本 SHALL 保留为复核来源上下文

#### Scenario: 提取结果无法映射
- **WHEN** 某条候选读数无法映射到已知实验室字典项
- **THEN** 确认状态 SHALL 将该行标记为需要复核
- **AND** 用户解决或排除该行之前，系统 SHALL NOT 将其保存为普通实验室读数

### Requirement: 已确认实验室报告持久化为批次和读数
系统 SHALL 将每次已确认的实验室报告保存为一个实验室报告批次，以及该批次下的多条实验室读数。

#### Scenario: 用户确认新报告
- **WHEN** 用户为选中患者记录确认一份实验室报告
- **THEN** 系统 SHALL 为选中患者、分类、检查日期、OCR / 复核状态和来源元数据创建一条 `lab_report_batches`
- **AND** 系统 SHALL 为每个已确认指标读数创建一条关联该批次的 `lab_results`

#### Scenario: 检测到同日同分类批次
- **WHEN** 选中患者已经存在同一分类、同一检查日期的实验室报告批次
- **THEN** 系统 SHALL 在持久化前提醒用户
- **AND** 用户 SHALL 选择替换已有批次读数或取消保存

### Requirement: 血常规派生指标在网页逻辑中生成
系统 SHALL 在网页端摄入流程中计算支持的血常规派生指标，而不是依赖本地 Excel 公式。

#### Scenario: 血常规绝对值齐全
- **WHEN** 已确认血常规读数包含计算 NLR、PLR 或 MLR 所需的值
- **THEN** 系统 SHALL 生成对应派生实验室读数
- **AND** 生成读数 SHALL 标记为派生指标

#### Scenario: 血常规源值缺失
- **WHEN** 某个派生指标因为分子或分母缺失、或分母为零而无法计算
- **THEN** 系统 SHALL 跳过该派生指标
- **AND** 系统 SHALL NOT 编造数值

### Requirement: 网页摄入路径不依赖本地 Excel
系统 SHALL NOT 要求本地 Excel 工作簿参与网页端实验室趋势的创建、查看或更新。

#### Scenario: 用户没有 Excel 也能上传截图
- **WHEN** 用户在 `/app` 输入区上传支持的实验室报告截图
- **THEN** 系统 SHALL 能够 OCR、确认并保存读数
- **AND** 系统 SHALL 不需要打开或更新任何本地 Excel 文件

#### Scenario: 既有 skill 映射作为产品参考
- **WHEN** 产品逻辑需要已知实验室项目、参考范围或血常规派生指标
- **THEN** 系统 MAY 使用既有 skill 映射作为参考材料
- **AND** 最终行为 SHALL 表达为网页端应用字典和 Supabase 数据结构

