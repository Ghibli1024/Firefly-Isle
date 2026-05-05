## ADDED Requirements

### Requirement: Record page Gantt view toggle
The system SHALL provide a `/record/:id` view switch that lets users choose between the existing dossier view and a treatment-line Gantt view.

#### Scenario: Switch to Gantt view
- **WHEN** a user opens `/record/:id` for a demo or real record
- **THEN** the page SHALL expose a "档案视图 / 甘特图视图" view switch
- **AND** selecting the Gantt option SHALL render the treatment-line Gantt view

#### Scenario: Workspace does not show Gantt view
- **WHEN** a user opens `/app`
- **THEN** the workspace SHALL NOT render the record Gantt view switch

### Requirement: Treatment lines render as chronological bars
The system SHALL render each treatment line with complete `startDate` and `endDate` as a horizontal bar ordered by `lineNumber`.

#### Scenario: Multiple treatment lines
- **WHEN** a record contains multiple treatment lines with valid start and end dates
- **THEN** the Gantt view SHALL render one row per line in ascending `lineNumber`
- **AND** each row SHALL show the regimen and a proportional horizontal duration bar

#### Scenario: Current treatment line
- **WHEN** a treatment line has `startDate` but no later completed line is active
- **THEN** the Gantt view SHALL visually mark the latest chronological line as the current line

### Requirement: Missing dates do not create fake durations
The system SHALL avoid drawing duration bars when a treatment line is missing `startDate` or `endDate`.

#### Scenario: Missing start date
- **WHEN** a treatment line has no `startDate`
- **THEN** the Gantt view SHALL show a "日期待补充" pending state for that row
- **AND** the row SHALL NOT draw a fake duration bar

#### Scenario: Missing end date
- **WHEN** a treatment line has a `startDate` but no `endDate`
- **THEN** the Gantt view SHALL show a "日期待补充" pending state for that row
- **AND** the row SHALL NOT draw a fake duration bar

### Requirement: Empty treatment lines are handled
The system SHALL render an empty Gantt state for records without treatment lines.

#### Scenario: No treatment lines
- **WHEN** a record has an empty `treatmentLines` array
- **THEN** the Gantt view SHALL show a readable empty state
- **AND** the page SHALL NOT throw a JavaScript error
