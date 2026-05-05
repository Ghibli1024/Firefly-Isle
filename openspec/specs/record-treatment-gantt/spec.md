# record-treatment-gantt Specification

## Purpose
Define the record-page Gantt view that turns a PatientRecord's initial onset and treatment lines into a readable treatment-plan timeline without changing the persistence schema.
## Requirements
### Requirement: Record page Gantt view toggle
The system SHALL provide a `/record/:id` view switch that lets users choose between the existing dossier view and a treatment-line Gantt view.

#### Scenario: Switch to Gantt view
- **WHEN** a user opens `/record/:id` for a demo or real record
- **THEN** the page SHALL expose a "档案视图 / 甘特图视图" view switch
- **AND** selecting the Gantt option SHALL render the treatment-line Gantt view

#### Scenario: Workspace does not show Gantt view
- **WHEN** a user opens `/app`
- **THEN** the workspace SHALL NOT render the record Gantt view switch

### Requirement: Treatment plan renders as fixed-side, scrollable timeline
The system SHALL render the Gantt view as a treatment-plan layout with left-side time/regimen/PFS rows, an independently scrollable horizontal timeline, and right-side supplemental information.

#### Scenario: Initial onset and treatment lines
- **WHEN** a record contains `initialOnset` and multiple `treatmentLines`
- **THEN** the Gantt view SHALL render the initial onset as baseline row `00`
- **AND** it SHALL render one row per treatment line in ascending `lineNumber`
- **AND** each row SHALL keep the left and right clinical information visible while the timeline area scrolls horizontally

#### Scenario: Scrollable timeline interaction
- **WHEN** a user focuses or drags the timeline area
- **THEN** the timeline SHALL support horizontal drag and ArrowLeft/ArrowRight/Home/End keyboard scrolling
- **AND** the page SHALL avoid requiring the whole record page to scroll horizontally on narrow viewports

### Requirement: Treatment durations render as chronological bars
The system SHALL render rows with usable dates as horizontal bars ordered by baseline and `lineNumber`.

#### Scenario: Multiple treatment lines
- **WHEN** a record contains multiple treatment lines with valid start and end dates
- **THEN** the Gantt view SHALL render one row per line in ascending `lineNumber`
- **AND** each row SHALL show the regimen, PFS label, supplemental information and a proportional horizontal duration bar

#### Scenario: Current treatment line
- **WHEN** a treatment line has a valid `startDate` and no `endDate`
- **THEN** the Gantt view SHALL treat it as an open ongoing line
- **AND** it SHALL draw a short current bar with a dashed continuation instead of a missing-date placeholder

### Requirement: Missing dates do not create fake durations
The system SHALL avoid drawing duration bars when a row is missing a usable start date or has an invalid date.

#### Scenario: Missing start date
- **WHEN** a treatment line has no `startDate`
- **THEN** the Gantt view SHALL show a "日期待补充" pending state for that row
- **AND** the row SHALL NOT draw a fake duration bar

#### Scenario: Invalid date
- **WHEN** a treatment row has a date value that cannot be parsed as year/month/day
- **THEN** the Gantt view SHALL show a "日期待补充" pending state for that row
- **AND** the row SHALL NOT draw a fake duration bar

### Requirement: Supplemental information stays display-only
The system SHALL show Gantt supplemental information by reading existing `biopsy`, `immunohistochemistry`, and `geneticTest` fields, with demo-only notes allowed for the default example.

#### Scenario: No schema change for supplemental notes
- **WHEN** the default demo Gantt renders clinical events such as metastasis, phenotype shift, stop reason, or current-line notes
- **THEN** those notes SHALL be provided as display-only demo copy
- **AND** the system SHALL NOT require a new PatientRecord field or Supabase migration

### Requirement: Empty treatment lines are handled
The system SHALL render an empty Gantt state for records without initial onset and treatment lines.

#### Scenario: No treatment lines
- **WHEN** a record has an empty `treatmentLines` array
- **THEN** the Gantt view SHALL show a readable empty state
- **AND** the page SHALL NOT throw a JavaScript error
