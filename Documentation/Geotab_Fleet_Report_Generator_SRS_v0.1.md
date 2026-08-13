# Software Requirements Specification (SRS)

# Geotab Fleet Report Generator

**Document Version:** 0.1  
**Status:** Draft  
**Based On:** Product Requirements Document (PRD) v0.1  
**Platform:** MyGeotab Add-In  
**Primary Data Source:** MyGeotab API  
**Initial Functional Module:** Device Online / Offline  
**Document Type:** Software Requirements Specification

---

# 1. Document Purpose

This Software Requirements Specification (SRS) defines the technical and functional requirements for the **Geotab Fleet Report Generator**.

The SRS translates the product requirements defined in the PRD into implementable software requirements.

This document is intended to provide a common reference for:

- Software development
- API research
- MyGeotab Add-In development
- UI/UX development
- Testing
- Debugging
- Code review
- Future feature expansion
- Project traceability

The system will be developed incrementally.

The first implementation target is:

> **Device Online / Offline Report**

Future KPI modules must be added independently after their respective API capabilities have been researched and verified.

---

# 2. Relationship With PRD

The PRD defines **what product should be built and why**.

This SRS defines **what the software must technically do to satisfy those requirements**.

```text
PRD
 │
 ├── Product Goals
 ├── User Requirements
 ├── Scope
 └── Product Principles
          │
          ▼
        SRS
          │
          ├── Functional Requirements
          ├── Non-Functional Requirements
          ├── API Requirements
          ├── UI Requirements
          ├── Data Requirements
          ├── Security Requirements
          ├── Testing Requirements
          └── Acceptance Criteria
```

---

# 3. Critical Accuracy Rule

## 3.1 No Assumptions Presented as Facts

Development must not invent MyGeotab capabilities.

The following must always be verified before implementation:

- Entity names
- Property names
- API methods
- API parameters
- API response structure
- Add-In configuration format
- Add-In lifecycle
- Authentication mechanism
- Permission requirements
- Rate limits
- Pagination behavior
- PDF capabilities
- Browser compatibility
- Data definitions

If something is not verified, it must be documented as:

```text
NEEDS VERIFICATION
```

or:

```text
TBD
```

or:

```text
UNKNOWN
```

It must not be implemented based solely on assumption.

---

# 4. System Scope

## 4.1 In Scope

The system will provide:

1. MyGeotab Add-In interface.
2. Access to MyGeotab data through the supported Add-In API mechanism.
3. Device Online / Offline reporting.
4. Device status summary.
5. Device status detail table.
6. Report filtering where supported.
7. Report preview.
8. PDF/print output.
9. Modular report architecture.
10. Error handling.
11. Logging/debugging support where appropriate.

---

# 5. Out of Scope

The first implementation does not include:

- Fuel consumption
- Distance utilization
- Alert analysis
- Idle analysis
- Route reconstruction
- Driver performance
- Maintenance
- Engine hours
- Geofence analysis
- Customer-specific KPI calculations

These are future modules.

---

# 6. System Architecture

## 6.1 Conceptual Architecture

The system should be structured around independent modules.

```text
┌──────────────────────────────────────┐
│          MyGeotab Add-In             │
│                                      │
│  ┌────────────────────────────────┐  │
│  │        Report Configuration    │  │
│  └───────────────┬────────────────┘  │
│                  │                   │
│  ┌───────────────▼────────────────┐  │
│  │        Report Controller       │  │
│  └───────────────┬────────────────┘  │
│                  │                   │
│        ┌─────────┴─────────┐         │
│        ▼                   ▼         │
│  ┌──────────────┐   ┌──────────────┐ │
│  │ Device Status│   │ Future       │ │
│  │ Module       │   │ KPI Modules  │ │
│  └──────┬───────┘   └──────────────┘ │
│         │                            │
│         ▼                            │
│  ┌────────────────────────────────┐  │
│  │       Report Data Model        │  │
│  └───────────────┬────────────────┘  │
│                  │                   │
│                  ▼                   │
│  ┌────────────────────────────────┐  │
│  │       Report Renderer          │  │
│  └───────────────┬────────────────┘  │
│                  │                   │
│          ┌───────┴────────┐          │
│          ▼                ▼          │
│      Preview             PDF         │
└──────────────────────────────────────┘
```

This is a conceptual architecture.

The exact implementation must be determined after MyGeotab Add-In research.

---

# 7. MyGeotab Integration Requirements

## 7.1 Add-In Integration

The application MUST operate as a MyGeotab Add-In.

The implementation MUST use the supported MyGeotab Add-In integration mechanism.

The following must be verified against official documentation before implementation:

- Add-In configuration schema
- Add-In file structure
- Add-In lifecycle
- Initialization method
- API object availability
- Navigation/menu placement
- Permissions
- Hosting requirements

### Status

```text
NEEDS VERIFICATION
```

---

# 8. API Integration

## 8.1 API Access

The application SHALL retrieve MyGeotab data through the API mechanism available to the Add-In.

The system SHALL NOT hard-code MyGeotab user credentials in client-side source code.

The exact authentication/session mechanism SHALL be determined from verified MyGeotab Add-In documentation.

---

# 9. Device Status Module

## 9.1 Objective

The Device Status module shall provide information required to determine the communication status of devices/vehicles.

The module must use an officially supported MyGeotab API data source.

---

# 10. Device Status API Research Requirements

Before implementation, the development team MUST verify:

| Requirement | Status |
|---|---|
| Device status entity | NEEDS VERIFICATION |
| API method | NEEDS VERIFICATION |
| Communication status field | NEEDS VERIFICATION |
| Timestamp field | NEEDS VERIFICATION |
| Device relationship | NEEDS VERIFICATION |
| Group relationship | NEEDS VERIFICATION |
| Permission requirement | NEEDS VERIFICATION |
| Data freshness | NEEDS VERIFICATION |
| API limits | NEEDS VERIFICATION |

No implementation should be considered final until these fields have been verified.

---

# 11. Device Online / Offline Definition

The system SHALL NOT independently invent an Online/Offline definition.

The Online/Offline classification SHALL be based on the verified MyGeotab data definition.

For example, if the verified API exposes a communication-status property, the system may use that property.

The exact implementation shall be documented in the Device Status Technical Specification after research.

---

# 12. Device Status Functional Requirements

## FR-001 — Retrieve Device Status

The system shall retrieve the required device communication status data from MyGeotab.

### Preconditions

- User is authenticated to MyGeotab.
- Add-In is loaded.
- User has sufficient permission.

### Result

The system receives verified device status data.

---

## FR-002 — Display Total Devices

The system shall display the total number of devices included in the current report scope.

Formula:

```text
Total Devices = Number of devices included in report scope
```

The exact definition of report scope shall be documented.

---

## FR-003 — Display Online Devices

The system shall display the number of devices classified as Online according to the verified MyGeotab status mechanism.

---

## FR-004 — Display Offline Devices

The system shall display the number of devices classified as Offline according to the verified MyGeotab status mechanism.

---

## FR-005 — Online Percentage

If supported by the verified status definition:

```text
Online Percentage =
Online Devices / Total Devices × 100
```

If Total Devices is zero:

```text
Online Percentage = N/A
```

The system shall not divide by zero.

---

## FR-006 — Offline Percentage

If supported by the verified status definition:

```text
Offline Percentage =
Offline Devices / Total Devices × 100
```

If Total Devices is zero:

```text
Offline Percentage = N/A
```

---

## FR-007 — Device Detail Table

The system shall display a detailed device table.

The final columns depend on verified API fields.

Potential fields:

| Field | Status |
|---|---|
| Device name | NEEDS VERIFICATION |
| Status | REQUIRED |
| Last communication | NEEDS VERIFICATION |
| Driving state | NEEDS VERIFICATION |
| Group | NEEDS VERIFICATION |

---

# 13. Filtering Requirements

## FR-008 — Vehicle Group Filtering

The system should support filtering by vehicle group if the required MyGeotab API capability is verified.

Status:

```text
NEEDS VERIFICATION
```

---

## FR-009 — Vehicle Filtering

The system may support selection of individual vehicles.

Status:

```text
FUTURE / NEEDS VERIFICATION
```

---

## FR-010 — Date Filtering

A reporting date/time range may be supported by future modules.

For the initial Device Online / Offline module, the requirement must first distinguish between:

- Current communication status
- Historical communication status

The UI must not expose a historical date filter for Device Status until the underlying API behavior has been verified.

Status:

```text
NEEDS VERIFICATION
```

---

# 14. Report Configuration Requirements

The application should eventually provide a module selector.

Example:

```text
Report Modules

[x] Device Online / Offline

[ ] Distance
[ ] Top Alerts
[ ] Fuel
[ ] Idle
```

Only implemented modules shall be selectable.

Future modules must be registered independently.

---

# 15. Modular Module Interface

Each report module should conceptually expose:

```text
Module Metadata
    ↓
Required API Data
    ↓
Data Retrieval
    ↓
Data Transformation
    ↓
KPI Calculation
    ↓
Report Section
```

A future module should not require direct modification of unrelated modules.

---

# 16. Proposed Module Contract

Conceptually:

```javascript
{
    id: "device-status",
    name: "Device Online / Offline",

    initialize: function () {},

    getRequirements: function () {},

    fetchData: function () {},

    processData: function () {},

    renderPreview: function () {},

    renderReport: function () {}
}
```

This is an architectural concept only.

The final interface must be determined during implementation.

---

# 17. Report Data Model

The application should separate raw API data from report data.

Conceptually:

```text
MyGeotab API Response
        ↓
API Adapter
        ↓
Normalized Data
        ↓
KPI Module
        ↓
Report Data
        ↓
Renderer
```

The PDF renderer should not directly depend on raw API response objects.

---

# 18. Report Model

A report should conceptually contain:

```text
Report
│
├── Metadata
│   ├── Customer
│   ├── Database
│   ├── Reporting Period
│   └── Generated Time
│
└── Sections
    ├── Device Status
    ├── Distance
    ├── Alerts
    └── Other Modules
```

Exact fields are TBD.

---

# 19. User Interface Requirements

## UI-001 — Add-In Page

The application shall provide a user interface inside MyGeotab.

The exact placement and Add-In navigation mechanism must be verified.

---

## UI-002 — Report Module Selection

The UI should provide a mechanism to select report modules.

Only implemented modules may be enabled.

---

## UI-003 — Report Parameters

The UI should provide supported report parameters.

Potential parameters:

- Vehicle Group
- Vehicle
- Date
- Time
- Customer
- Report format

Only verified parameters should be implemented.

---

## UI-004 — Generate Report

The user shall be able to generate a report after required parameters have been selected.

---

## UI-005 — Report Preview

The system shall display the generated report before PDF output where technically supported.

---

## UI-006 — Loading State

The application shall display a loading state while API data is being retrieved.

Example:

```text
Loading fleet data...
```

---

## UI-007 — Empty State

If no applicable data is returned, the system shall display an informative message.

Example:

```text
No device data is available for the selected scope.
```

The system must not display fabricated zero values unless zero is actually supported by the returned data.

---

# 20. PDF Requirements

## PDF-001 — PDF Output

The system shall provide a mechanism to generate or print the report as PDF.

The exact PDF implementation must be selected after compatibility research.

Status:

```text
NEEDS VERIFICATION
```

---

## PDF-002 — Report Consistency

The PDF values shall match the values displayed in the report preview.

---

## PDF-003 — PDF Layout

The final report should support:

- A4
- Header
- Report title
- Customer information
- Reporting period
- KPI sections
- Tables
- Footer
- Page numbers

Specific formatting is TBD.

---

# 21. Date and Time Requirements

## DT-001 — Centralized Time Handling

All modules should use a centralized date/time utility.

Individual modules should not implement unrelated timezone conversion logic.

---

## DT-002 — Timezone Verification

The system must verify:

- API timezone behavior
- MyGeotab database timezone
- Browser timezone
- Report timezone

Status:

```text
NEEDS VERIFICATION
```

---

# 22. API Performance Requirements

## PERF-001 — Minimal Data Retrieval

The system shall retrieve only data required by selected modules.

---

## PERF-002 — Pagination

The system shall support pagination if required by the relevant MyGeotab API operation.

Status:

```text
NEEDS VERIFICATION
```

---

## PERF-003 — API Limits

The implementation shall respect verified MyGeotab API limits.

The application shall not assume that unlimited API requests are available.

Exact limits must be documented during API research.

---

## PERF-004 — Large Fleet Handling

The system should be designed to support fleets containing hundreds or potentially thousands of vehicles.

The implementation shall be tested against an appropriate fleet size.

---

# 23. Security Requirements

## SEC-001 — Credential Protection

The application must not hard-code MyGeotab credentials in client-side source code.

---

## SEC-002 — User Permissions

The system shall respect the permissions of the authenticated MyGeotab user.

---

## SEC-003 — Customer Data Isolation

The application shall not intentionally expose data belonging to another database/customer context.

---

## SEC-004 — Sensitive Data

Sensitive fleet information shall not be written to unnecessary external services.

The exact data flow must be documented before any external service is introduced.

---

# 24. Error Handling Requirements

## ERR-001 — API Failure

If an API request fails, the system shall display a clear error message.

Example:

```text
Unable to retrieve fleet data.
Please try again.
```

---

## ERR-002 — Permission Error

If the user does not have the required permission, the system shall display an appropriate message.

---

## ERR-003 — Empty Data

If no data is returned, the system shall display an empty-state message.

---

## ERR-004 — Invalid Data

The system shall not silently convert invalid or unknown API data into a valid KPI value.

---

## ERR-005 — PDF Failure

If PDF generation fails, the user shall be informed.

---

# 25. Logging and Debugging

The development version should provide sufficient diagnostic information to identify:

- API failures
- Invalid responses
- Module failures
- Rendering failures
- Configuration problems

Production logging must avoid unnecessarily exposing sensitive customer data.

The exact logging implementation is TBD.

---

# 26. Testing Requirements

Testing shall be performed per module.

## 26.1 Device Status Tests

### TC-001 — Device Status Retrieval

Verify that the application can retrieve the required Device Status data.

Expected:

```text
PASS
```

when the API returns valid data.

---

### TC-002 — Online Classification

Verify that devices classified as Online match the verified MyGeotab definition.

---

### TC-003 — Offline Classification

Verify that devices classified as Offline match the verified MyGeotab definition.

---

### TC-004 — Percentage Calculation

Verify:

```text
Online + Offline = Total
```

only when the underlying status categories are mutually exclusive and exhaustive according to the verified data definition.

Otherwise, the report must document the actual category behavior.

---

### TC-005 — Empty Fleet

Verify behavior when no devices are returned.

---

### TC-006 — API Error

Verify application behavior when API access fails.

---

### TC-007 — Permission Error

Verify behavior when the user lacks required permissions.

---

### TC-008 — Large Fleet

Test with an appropriately large fleet.

The exact test size is TBD.

---

### TC-009 — PDF Consistency

Compare report preview and PDF values.

Expected:

```text
All displayed KPI values match.
```

---

# 27. Acceptance Criteria

The Device Online / Offline module will be considered complete only when:

1. The Add-In loads successfully in MyGeotab.
2. The Add-In uses a verified MyGeotab API mechanism.
3. Device status data is successfully retrieved.
4. Online/Offline classification is based on verified MyGeotab behavior.
5. Total device count is correct.
6. Online count is correct.
7. Offline count is correct.
8. Percentage calculations are correct where applicable.
9. Device detail data is correct.
10. Errors are handled appropriately.
11. The report preview is functional.
12. PDF/print output is functional or the selected verified output mechanism is functional.
13. PDF/preview values match.
14. No undocumented API assumptions remain in the implemented module.
15. The implementation is documented.

---

# 28. Traceability Matrix

| PRD Requirement | SRS Requirement | Implementation | Test | Status |
|---|---|---|---|---|
| Configurable reports | FR report configuration | TBD | TBD | PLANNED |
| Device Online/Offline | FR-001 to FR-007 | TBD | TC-001 to TC-004 | NOT STARTED |
| Vehicle filtering | FR-008 / FR-009 | TBD | TBD | NEEDS VERIFICATION |
| PDF report | PDF-001 to PDF-003 | TBD | TC-009 | NEEDS VERIFICATION |
| Scalable modules | Module architecture | TBD | Integration tests | PLANNED |
| API efficiency | PERF-001 to PERF-004 | TBD | Performance tests | PLANNED |
| Security | SEC-001 to SEC-004 | TBD | Security review | PLANNED |

---

# 29. Requirement Status Definitions

The following statuses shall be used throughout development:

| Status | Meaning |
|---|---|
| `NOT STARTED` | Work has not begun |
| `RESEARCHING` | Technical investigation is in progress |
| `VERIFIED` | Confirmed from reliable evidence |
| `IMPLEMENTED` | Implemented in code |
| `TESTING` | Implementation is being tested |
| `PASS` | Requirement passed testing |
| `FAIL` | Requirement failed testing |
| `TBD` | Decision has not yet been made |
| `NEEDS VERIFICATION` | Information is not yet sufficiently verified |
| `BLOCKED` | Work cannot continue because of a dependency |

---

# 30. Development Traceability Rules

Every feature must have:

```text
Requirement ID
      ↓
Research Evidence
      ↓
Technical Decision
      ↓
Source Code
      ↓
Test Case
      ↓
Test Result
```

Example:

```text
FR-001
   ↓
MyGeotab API Documentation
   ↓
Verified API Entity/Method
   ↓
device-status module
   ↓
TC-001
   ↓
PASS
```

---

# 31. Change Management

Any new feature must first be evaluated against:

1. PRD scope
2. SRS requirements
3. MyGeotab API capability
4. Existing architecture
5. Security implications
6. Performance implications
7. Testing requirements

A feature must not be added simply because it appears technically possible.

---

# 32. Future Module Requirements

Before adding a new KPI module, the following document must be created:

```text
Module Name
Purpose
Business Definition
Required MyGeotab Data
API Entity
API Method
Required Fields
Filters
Calculation
Output
Error Cases
Performance Considerations
Test Cases
Acceptance Criteria
```

The module cannot move to implementation until the relevant API/data source has been verified.

---

# 33. Future Module Example

A future Fuel Consumption module should NOT begin with coding.

The process should be:

```text
Business KPI Definition
        ↓
MyGeotab API Research
        ↓
Verify Available Fuel Data
        ↓
Determine Calculation
        ↓
Define Data Model
        ↓
Define UI
        ↓
Implement
        ↓
Test
        ↓
Validate
```

If the required data cannot be verified:

```text
STATUS = NEEDS VERIFICATION
```

---

# 34. Versioning

The project should use document and software versioning.

Example:

```text
PRD v0.1
SRS v0.1
Device Status Module v0.1
```

After major architectural changes:

```text
SRS v0.2
```

After the first stable release:

```text
SRS v1.0
```

---

# 35. Current System Status

```text
Product:
Geotab Fleet Report Generator

PRD:
v0.1 — Draft

SRS:
v0.1 — Draft

Current Phase:
Phase 0 — Research & Architecture

Current Feature:
Device Online / Offline

Implementation:
NOT STARTED

API Verification:
NOT STARTED

Testing:
NOT STARTED
```

---

# 36. Immediate Next Step

The next development activity SHALL be:

# Phase 0 — MyGeotab Research

Research and verify:

1. MyGeotab Add-In architecture.
2. Add-In configuration schema.
3. Add-In lifecycle.
4. API access available to Add-Ins.
5. Device status entity/data source.
6. Online/Offline definition.
7. Required properties.
8. Permissions.
9. API limits.
10. Pagination/data retrieval behavior.
11. Date/time behavior.
12. PDF generation options.
13. Scalable module architecture.

Only after this research is completed should implementation begin.

---

# 37. Final Engineering Principle

The project shall follow:

> **Do not guess when the platform can be researched.**

If MyGeotab documentation or verified API behavior does not provide enough information, the requirement remains:

```text
NEEDS VERIFICATION
```

until sufficient evidence is available.

The system must prioritize:

```text
Accuracy
    ↓
Traceability
    ↓
Reliability
    ↓
Scalability
    ↓
Feature Expansion
```

over rapid feature implementation.
