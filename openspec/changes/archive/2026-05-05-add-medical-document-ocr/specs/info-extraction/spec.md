## ADDED Requirements

### Requirement: Confirmed OCR text reuses structured extraction
The system SHALL feed confirmed OCR text into the existing natural-language PatientRecord extraction flow.

#### Scenario: Confirmed OCR text creates PatientRecord
- **WHEN** a user confirms recognized OCR text and no current PatientRecord exists
- **THEN** the system SHALL call the existing structured extraction flow
- **AND** the resulting PatientRecord SHALL render through the existing preview and follow-up path

#### Scenario: Confirmed OCR text merges with existing PatientRecord
- **WHEN** a user confirms recognized OCR text while a PatientRecord already exists
- **THEN** the system SHALL reuse the existing merge semantics for extracted PatientRecord updates
- **AND** fields not mentioned in the OCR text SHALL NOT be overwritten
