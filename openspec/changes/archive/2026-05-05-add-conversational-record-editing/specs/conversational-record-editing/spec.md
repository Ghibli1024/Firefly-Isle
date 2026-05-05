## ADDED Requirements

### Requirement: Main input supports natural-language edits for existing records
The system SHALL treat main-input commands as edits when an active PatientRecord already exists.

#### Scenario: Modify basicInfo field
- **WHEN** the user enters a command that changes a basicInfo field on an existing record
- **THEN** the system SHALL update that target field
- **AND** all unmentioned fields SHALL remain unchanged

#### Scenario: Modify initialOnset field
- **WHEN** the user enters a command that changes an initialOnset field on an existing record
- **THEN** the system SHALL update that target field
- **AND** all unmentioned fields SHALL remain unchanged

#### Scenario: Modify treatmentLine fields
- **WHEN** the user enters a command that changes regimen, startDate, or endDate for an existing treatment line
- **THEN** the system SHALL update only the targeted treatment line field
- **AND** other treatment lines SHALL remain unchanged

### Requirement: Edit intents are validated before merge
The system SHALL require LLM edit output to pass field-target validation before mutating PatientRecord state.

#### Scenario: LLM returns field-level edit intent
- **WHEN** the LLM parses a conversational edit command
- **THEN** it SHALL return field-level edit intents using the PatientFieldTarget writable surface
- **AND** the system SHALL reject invalid sections, invalid fields, or invalid treatment line numbers

#### Scenario: Empty or invalid edits fail safely
- **WHEN** the LLM returns no valid edit intents
- **THEN** the system SHALL show a recoverable failure state
- **AND** the current PatientRecord SHALL remain unchanged

### Requirement: Edit merge preserves omitted fields
The system SHALL merge conversational edits into the existing PatientRecord without overwriting fields that the command did not mention.

#### Scenario: Unmentioned fields remain unchanged
- **WHEN** a conversational edit updates one field
- **THEN** all other basicInfo, initialOnset, treatmentLine, and labResults values SHALL remain unchanged

#### Scenario: Clear field
- **WHEN** a conversational edit explicitly clears a supported field
- **THEN** the system SHALL set that field to undefined
- **AND** the merge SHALL preserve all other fields

### Requirement: Edit feedback and retry
The system SHALL provide visible feedback for conversational edit success and failure, and allow failed edits to retry.

#### Scenario: Edit succeeds
- **WHEN** a conversational edit is parsed, merged, and persisted
- **THEN** the workspace SHALL show visible success feedback

#### Scenario: Edit fails and retries
- **WHEN** a conversational edit parse or persistence attempt fails
- **THEN** the workspace SHALL show a recoverable error
- **AND** retry SHALL rerun the edit command against the existing PatientRecord rather than starting a new extraction
