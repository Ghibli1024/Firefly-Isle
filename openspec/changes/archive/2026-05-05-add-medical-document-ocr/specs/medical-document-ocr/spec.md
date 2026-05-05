## ADDED Requirements

### Requirement: Medical document upload accepts images and PDFs
The system SHALL allow users to upload medical-document images and PDFs from `/app` for OCR.

#### Scenario: Image OCR succeeds
- **WHEN** a user uploads a supported image file
- **THEN** the system SHALL send the file to the server-side OCR boundary
- **AND** the page SHALL show the recognized raw text for confirmation

#### Scenario: PDF OCR succeeds
- **WHEN** a user uploads a supported PDF file
- **THEN** the system SHALL send the PDF to the server-side OCR boundary
- **AND** the page SHALL show the recognized raw text for confirmation

#### Scenario: Unsupported file type
- **WHEN** a user uploads a file that is not an image or PDF
- **THEN** the system SHALL reject it before extraction
- **AND** the page SHALL show a localized recoverable error

### Requirement: OCR keys remain server-side
The system SHALL keep OCR provider API keys out of browser-readable configuration, browser requests, and browser logs.

#### Scenario: Browser calls OCR boundary
- **WHEN** the browser submits a medical document for OCR
- **THEN** the browser request SHALL target the application OCR boundary
- **AND** the browser SHALL NOT include provider API keys or provider secret headers

### Requirement: OCR text requires confirmation
The system SHALL require users to confirm recognized text before it enters PatientRecord extraction.

#### Scenario: Recognized text awaits confirmation
- **WHEN** OCR returns raw text
- **THEN** the page SHALL show the text in a confirmation state
- **AND** the current PatientRecord SHALL remain unchanged until the user confirms

#### Scenario: Confirmed text enters extraction
- **WHEN** the user confirms recognized OCR text
- **THEN** the system SHALL run the existing structured extraction flow using that text

### Requirement: OCR failures are recoverable
The system SHALL keep failed OCR attempts recoverable and avoid polluting the current PatientRecord.

#### Scenario: OCR provider fails
- **WHEN** the OCR boundary returns an error
- **THEN** the page SHALL show a localized recoverable error
- **AND** the current PatientRecord SHALL remain unchanged

#### Scenario: OCR text is empty
- **WHEN** OCR completes without readable text
- **THEN** the page SHALL show a localized recoverable error
- **AND** the current PatientRecord SHALL remain unchanged
