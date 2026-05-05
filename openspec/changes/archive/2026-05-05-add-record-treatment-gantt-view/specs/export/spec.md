## ADDED Requirements

### Requirement: Alternate record views preserve dossier export
The system SHALL keep formal PDF/PNG export behavior stable when `/record/:id` gains alternate views.

#### Scenario: Dossier export remains available
- **WHEN** a user opens a real `/record/:id` record
- **THEN** the dossier view SHALL still provide PDF and PNG export actions
- **AND** those actions SHALL keep using the existing `firefly-{YYYY-MM-DD}` file naming behavior

#### Scenario: Gantt view does not hijack export
- **WHEN** a user switches to the Gantt view
- **THEN** the page SHALL NOT silently redirect the existing PDF/PNG export actions to a different DOM target
