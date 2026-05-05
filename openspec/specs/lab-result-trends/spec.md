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
