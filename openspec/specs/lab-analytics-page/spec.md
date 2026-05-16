# lab-analytics-page Specification

## Purpose
TBD - created by archiving change add-lab-analytics-page. Update Purpose after archive.
## Requirements
### Requirement: 统计页提供独立指标管理路由
系统 SHALL 为当前或选中的患者记录提供独立的 `指标管理` 网页页面。

#### Scenario: 用户打开统计入口
- **WHEN** 已认证用户点击侧栏 `统计` 入口
- **THEN** 系统 SHALL 导航到真实记录的 `/analytics/:id` 或无输入时的 `/analytics/demo`
- **AND** 页面 SHALL 使用共享应用壳层、侧栏、顶部状态区、主题 token 和语言行为

#### Scenario: 用户直接打开统计根路径
- **WHEN** 已认证用户访问 `/analytics`
- **THEN** 系统 SHALL 跳转到 `/analytics/demo`
- **AND** 系统 SHALL NOT 停留在空白统计根路径

#### Scenario: 用户打开演示统计页
- **WHEN** 已认证用户访问 `/analytics/demo`
- **THEN** 页面 SHALL 渲染独立的演示指标趋势读数
- **AND** 页面 SHALL 标记这些读数为演示数据
- **AND** 页面 SHALL NOT 将演示读数保存到 Supabase 或污染 `/record/demo`

#### Scenario: 统计页没有已保存指标读数
- **WHEN** 选中患者没有已保存的指标读数
- **THEN** 页面 SHALL 展示空态，说明当前暂无已保存指标
- **AND** 页面 SHALL 指向 `/app` 输入区作为病历 / 指标资料上传入口
- **AND** 页面 SHALL 提供 `/analytics/demo` 作为显式演示入口
- **AND** 页面 SHALL NOT 伪造 demo 读数

### Requirement: 统计页按分类组织指标
系统 SHALL 将指标分为血常规、血生化和肿瘤标志物三组。

#### Scenario: 用户切换指标分类
- **WHEN** 用户选择 `血常规`、`血生化` 或 `肿瘤标志物`
- **THEN** 指标列表 SHALL 展示该分类下的读数
- **AND** 除非用户选择其他指标，当前图表 SHALL 只从该分类读数更新

#### Scenario: 指标列表显示状态
- **WHEN** 指标列表渲染已保存读数
- **THEN** 每个可见指标行 SHALL 包含指标名称、最新值、最新状态和最近日期
- **AND** 异常或肿瘤标志物上涨指标 SHALL 通过视觉和文字同时区分，不得只依赖颜色

### Requirement: 选择指标后渲染网页端趋势图和表格
系统 SHALL 为选中的指标渲染网页端折线图和等价数据表。

#### Scenario: 指标有多个带日期读数
- **WHEN** 用户选择一个拥有两个或更多带日期读数的指标
- **THEN** 页面 SHALL 为该指标渲染按时间排序的折线图
- **AND** 页面 SHALL 渲染包含日期、数值、单位、参考范围和状态的等价数据表

#### Scenario: 指标只有一个带日期读数
- **WHEN** 用户选择一个只有一个带日期读数的指标
- **THEN** 页面 SHALL 渲染最新值和等价数据表
- **AND** 页面 SHALL 说明需要更多读数才能形成趋势线

#### Scenario: 指标有参考范围
- **WHEN** 选中指标存在参考范围
- **THEN** 图表 SHALL 将参考范围或参考上限 / 下限作为非诊断视觉辅助展示
- **AND** 等价数据表 SHALL 用文字展示同一参考范围

### Requirement: 统计页汇总最近异常指标
系统 SHALL 汇总每个指标分类最近一次已保存检查中的异常指标。

#### Scenario: 分类最近一次检查存在异常读数
- **WHEN** 某分类最近一次已保存检查中存在低于参考下限或高于参考上限的读数
- **THEN** 统计页 SHALL 在最近异常汇总中列出这些读数
- **AND** 每行 SHALL 包含指标名称、数值、参考范围、单位和偏高 / 偏低状态

#### Scenario: 分类最近一次检查没有异常读数
- **WHEN** 某分类最近一次已保存检查中没有带参考范围的异常读数
- **THEN** 统计页 SHALL 说明该分类最近一次检查未发现异常指标

### Requirement: 统计页汇总肿瘤标志物连续上涨
系统 SHALL 汇总连续两次上涨超过 20% 的肿瘤标志物。

#### Scenario: 肿瘤标志物满足上涨规则
- **WHEN** 某肿瘤标志物有三个按时间排序的有效读数，并且最近两个相邻区间涨幅都大于 20%
- **THEN** 统计页 SHALL 在上涨提醒面板中列出该肿瘤标志物
- **AND** 面板 SHALL 展示三个数值、对应日期和累计涨幅

#### Scenario: 肿瘤标志物不满足上涨规则
- **WHEN** 某肿瘤标志物少于三个有效读数，或少于两个相邻区间涨幅大于 20%
- **THEN** 统计页 SHALL NOT 将该指标列为连续上涨提醒

### Requirement: 统计页文案保持非诊断
统计页 SHALL 将指标趋势输出表达为辅助随访记录，而不是诊断或治疗建议。

#### Scenario: 页面渲染监测提醒
- **WHEN** 页面渲染最近异常指标或肿瘤标志物上涨提醒
- **THEN** 页面 SHALL 包含非诊断提示
- **AND** 页面 SHALL NOT 输出诊断、进展结论、用药指令或治疗建议

