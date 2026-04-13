## ADDED Requirements

### Requirement: PDF 导出
系统 SHALL 支持将时间线表格导出为 PDF 文件，使用 html2canvas 截图后经 jsPDF 生成，文件名包含当前日期。

#### Scenario: PDF 导出文件命名
- **WHEN** 用户触发 PDF 导出
- **THEN** 系统 SHALL 生成文件名格式为 `firefly-{YYYY-MM-DD}.pdf` 的文件并触发浏览器下载

#### Scenario: PDF 导出内容完整性
- **WHEN** PDF 生成完成
- **THEN** 生成的 PDF SHALL 包含完整时间线表格，不得截断任何行或列

### Requirement: PNG 图片导出
系统 SHALL 支持将时间线表格导出为 PNG 图片，使用 html2canvas 截图，文件名包含当前日期。

#### Scenario: PNG 导出文件命名
- **WHEN** 用户触发 PNG 导出
- **THEN** 系统 SHALL 生成文件名格式为 `firefly-{YYYY-MM-DD}.png` 的文件并触发浏览器下载

#### Scenario: PNG 导出分辨率
- **WHEN** PNG 生成完成
- **THEN** 图片 SHALL 以 2x 设备像素比（scale: 2）渲染，确保在高分屏上文字清晰

### Requirement: 导出中 loading 状态
系统 SHALL 在导出过程中向用户展示 loading 状态，禁止重复触发导出操作。

#### Scenario: 导出按钮 loading
- **WHEN** 用户点击导出按钮且导出尚未完成
- **THEN** 导出按钮 SHALL 显示 loading 指示器且变为不可点击状态

#### Scenario: 导出完成后恢复
- **WHEN** 导出操作成功或失败
- **THEN** 导出按钮 SHALL 恢复为可点击状态，loading 状态消失

### Requirement: 导出失败处理
系统 SHALL 在导出失败时向用户展示错误提示，不得静默失败。

#### Scenario: 导出异常提示
- **WHEN** html2canvas 或 jsPDF 抛出异常
- **THEN** 系统 SHALL 向用户展示可读的错误信息，并在控制台输出完整错误堆栈
