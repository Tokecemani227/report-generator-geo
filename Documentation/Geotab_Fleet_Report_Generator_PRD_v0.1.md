# Product Requirements Document (PRD)

# Geotab Fleet Report Generator

**Document Version:** 0.1  
**Status:** Draft  
**Development Phase:** Phase 0 — Product & Architecture Definition  
**Platform:** MyGeotab Add-In  
**Primary Data Source:** MyGeotab API  
**Initial Module:** Device Online / Offline

---

# 1. Product Overview

## 1.1 Product Name

**Geotab Fleet Report Generator**

## 1.2 Product Description

Geotab Fleet Report Generator is a MyGeotab Add-In designed to help fleet management and telematics teams create configurable fleet reports using data available through the MyGeotab API.

The application will allow users to select the report information they need and generate a structured report that can ultimately be exported or printed as a PDF.

The system is intended to support different customers with different KPI requirements.

Instead of creating a separate reporting application for every customer, the system will use a modular report architecture where individual KPI modules can be enabled and combined according to customer requirements.

---

# 2. Problem Statement

Fleet monitoring reports are often created manually by collecting data from MyGeotab and processing it in spreadsheets or other reporting tools.

Different customers may require different KPIs, for example:

- Device Online / Offline
- Distance Utilization
- Top Alerts
- Fuel Consumption
- Idle Time
- Driving Behavior
- Route Utilization
- Engine Hours
- Maintenance
- Driver Performance

Creating and maintaining separate reports for every customer creates several problems:

- Repetitive manual work
- High risk of calculation errors
- Difficult report maintenance
- Difficult KPI customization
- Difficult scaling to additional customers
- Repeated API/data extraction work

The proposed solution is a reusable MyGeotab Add-In that provides a configurable report-generation framework.

---

# 3. Product Goal

The primary goal is to create a reusable and scalable MyGeotab reporting tool that:

1. Retrieves verified data from MyGeotab.
2. Allows users to select reporting parameters.
3. Allows users to select report modules/KPIs.
4. Generates a consistent report structure.
5. Allows the report to be printed/saved as PDF.
6. Supports different customer KPI requirements.
7. Allows new KPI modules to be added independently.
8. Minimizes changes to existing modules when new modules are introduced.

---

# 4. Development Philosophy

The project must follow:

> **One Module at a Time + Scalable Architecture**

The project must NOT attempt to implement every KPI at once.

Development will follow:

```text
Research
    ↓
Design
    ↓
Implement One Module
    ↓
Test
    ↓
Validate Against MyGeotab
    ↓
Stabilize
    ↓
Document
    ↓
Add Next Module
```

The first module will be:

# Device Online / Offline

After this module is stable, additional modules may be added.

---

# 5. Critical Accuracy Principle

## 5.1 No Invented MyGeotab Information

The system development must be based on verified MyGeotab documentation and/or verified API behavior.

The development process must NOT invent:

- API methods
- API entities
- API fields
- API parameters
- Device status definitions
- KPI definitions
- Data availability
- MyGeotab behavior
- Add-In behavior
- Authentication behavior
- API limitations

If information cannot be verified, it must be explicitly marked as:

```text
UNKNOWN
```

or:

```text
NEEDS VERIFICATION
```

The development process must never silently replace missing information with an assumption.

---

# 6. Primary Technical Reference

The primary technical reference is the official MyGeotab SDK/API documentation:

https://geotab.github.io/sdk/

Official MyGeotab documentation should be prioritized over third-party sources.

Third-party information may only be used as supplementary information and must not override official documentation.

---

# 7. Target Users

The primary users are expected to include:

- Fleet Management Analysts
- Telematics Helpdesk
- Command Center Operators
- Fleet Supervisors
- Reporting Teams
- Customer Support / Account Teams

The system should be usable by users who understand fleet operations but do not necessarily need to understand the underlying MyGeotab API.

---

# 8. Initial User Workflow

The intended workflow is:

```text
Open MyGeotab
      ↓
Open Fleet Report Generator Add-In
      ↓
Select Report Parameters
      ↓
Select Report Modules
      ↓
Generate Report Preview
      ↓
Review Data
      ↓
Generate / Print PDF
```

---

# 9. Initial Product Scope

## 9.1 In Scope

The first development phase will focus on:

### Add-In Foundation

- MyGeotab Add-In integration
- Add-In configuration
- Add-In page/interface
- MyGeotab API access
- Basic error handling
- Basic report architecture

### First Report Module

- Device Online / Offline

### Initial Report Output

- Total devices
- Online devices
- Offline devices
- Online percentage
- Offline percentage
- Device list
- Device status
- Last communication information, if verified and available
- Vehicle/group filtering, if supported by verified API data

### Report Output

- Report preview
- Print / Save as PDF

---

# 10. Out of Scope for Phase 1

The following will NOT be implemented in the first module:

- Fuel Consumption
- Distance Utilization
- Top Alerts
- Idle Time
- Harsh Braking
- Harsh Acceleration
- Speeding
- Route Reconstruction
- Geofence Analysis
- Driver Performance
- Maintenance
- Engine Hours
- Fault Analysis
- Customer-specific KPI formulas

These features belong to future development phases.

---

# 11. Future KPI Modules

The following modules are potential future features.

They are not yet considered technically confirmed until the relevant MyGeotab API/data source has been researched.

Potential modules include:

```text
Fleet Summary
Device Online / Offline
Distance Utilization
Trip Analysis
Top Alerts
Fuel Consumption
Idle Time
Harsh Driving
Speeding
Route Utilization
Geofence Activity
Driver Performance
Engine Hours
Faults
Maintenance
```

Each module must be researched and validated individually before implementation.

---

# 12. Modular Architecture Requirement

The system must use a modular architecture.

Conceptually:

```text
Fleet Report Generator
│
├── Core
│   ├── MyGeotab API
│   ├── Authentication / Session
│   ├── Date & Time
│   ├── Error Handling
│   └── Shared Utilities
│
├── Report Modules
│   ├── Device Status
│   ├── Distance
│   ├── Alerts
│   ├── Fuel
│   ├── Idle
│   └── Future Modules
│
└── Report Output
    ├── Preview
    └── PDF
```

This structure is conceptual.

The final technical architecture must be determined after researching the actual MyGeotab Add-In and API capabilities.

---

# 13. Module Independence

Each KPI module should ideally contain separate responsibilities for:

```text
Data Retrieval
      ↓
Data Processing
      ↓
Calculation
      ↓
Report Model
      ↓
Preview Rendering
      ↓
PDF Rendering
```

Adding a new KPI must not require rewriting existing KPI modules.

For example:

```text
Device Status
       ↓
Stable

Add Distance
       ↓
Device Status remains unchanged
Distance is added as a separate module
```

---

# 14. Report Configuration

The future report builder should allow users to choose which modules are included.

Example:

```text
Report Modules

[x] Device Online / Offline

[ ] Distance Utilization
[ ] Top Alerts
[ ] Fuel Consumption
[ ] Idle Time
[ ] Harsh Driving
[ ] Route Utilization
```

Only modules that have actually been implemented and validated should be selectable.

Unimplemented modules must not appear as functional options.

---

# 15. Customer KPI Flexibility

Different customers may have different reporting requirements.

Example:

### Customer A

```text
Device Status
Distance
Alerts
```

### Customer B

```text
Device Status
Fuel
Idle Time
```

### Customer C

```text
Device Status
Distance
Route
Driving Behavior
```

The system should eventually allow report configuration without requiring a separate application for every customer.

---

# 16. Report Structure

The eventual report should conceptually contain:

```text
REPORT HEADER

Customer
Database
Reporting Period
Generated Date

--------------------------------

SELECTED KPI MODULES

Module 1
Device Status

Module 2
Distance

Module 3
Alerts

...

--------------------------------

REPORT FOOTER
```

The exact design will be finalized during UI/UX design.

---

# 17. Device Online / Offline Module

## 17.1 Objective

Provide a reliable summary of the current communication status of vehicles/devices based on verified MyGeotab data.

## 17.2 Required Research

Before implementation, determine:

- Which MyGeotab entity contains the required status data.
- Which API method retrieves the data.
- Which property represents communication status.
- How MyGeotab defines the status.
- Whether the status is current or historical.
- How timestamps are represented.
- How timezone should be handled.
- Whether missing communication data has a defined meaning.
- Whether all devices expose the same information.

No assumptions may be made.

---

# 18. Initial Device Status Report

The intended report structure is approximately:

```text
Device Online / Offline

Total Devices: XX

Online: XX
Offline: XX

Online Rate: XX%
Offline Rate: XX%
```

Detailed table:

| No. | Vehicle | Status | Last Communication |
|---:|---|---|---|
| 1 | Vehicle A | Online | ... |
| 2 | Vehicle B | Offline | ... |
| 3 | Vehicle C | Online | ... |

Actual fields will depend on verified MyGeotab API data.

---

# 19. Filtering

The report should eventually support:

### Reporting Period

```text
Start Date
End Date
```

### Vehicle Selection

```text
All Vehicles
Vehicle Group
Specific Vehicles
```

However, filtering options must only be implemented after verifying that the corresponding MyGeotab API data and Add-In capabilities support them.

---

# 20. Timezone Requirements

Timezone must be treated as a first-class concern.

The system must investigate:

- MyGeotab database timezone
- API timestamp format
- UTC conversion
- Browser timezone
- Report timezone

A centralized date/time utility should be used across modules.

Individual KPI modules should not implement independent timezone logic.

---

# 21. PDF Requirements

The final product must be capable of producing a professional PDF report.

The report should eventually support:

- A4 layout
- Header
- Customer name
- Reporting period
- KPI sections
- Tables
- Charts where appropriate
- Page numbering
- Footer
- Customer branding where required

The PDF technology must be selected after evaluating compatibility with the MyGeotab Add-In environment.

---

# 22. API Efficiency

The application should only request data required by selected modules.

For example:

If the user selects only:

```text
Device Status
```

the system should not unnecessarily retrieve large datasets for:

- Trips
- Fuel
- Alerts
- GPS history
- Other unrelated KPIs

Future modules should declare their required data.

---

# 23. Scalability Requirements

The architecture should be capable of supporting:

- Small fleets
- Hundreds of vehicles
- Potentially thousands of vehicles
- Multiple MyGeotab databases
- Daily reporting
- Weekly reporting
- Monthly reporting
- Multiple KPI combinations

Performance considerations should include:

- API request limits
- Pagination
- GetFeed where appropriate
- Data volume
- Caching where appropriate
- Request efficiency
- PDF generation performance

The MVP should remain simple.

Do not introduce unnecessary infrastructure unless justified.

---

# 24. Security Requirements

The system must consider:

- MyGeotab authentication
- User permissions
- Database access
- API credentials
- Session handling
- Sensitive data
- Customer data separation

Credentials must not be hard-coded into client-side source code.

The exact authentication architecture must be based on verified MyGeotab Add-In capabilities.

---

# 25. Error Handling

The system should handle:

- API failure
- Session expiration
- Permission errors
- Missing data
- Invalid API responses
- Empty datasets
- Network errors
- PDF generation errors

Errors should be understandable to the user.

Technical details should be available for debugging where appropriate.

---

# 26. Testing Strategy

Each module must be tested independently.

For Device Online / Offline:

### Test Case 1

All devices communicating.

Expected:

```text
All devices classified according to the verified MyGeotab status mechanism.
```

### Test Case 2

Some devices not communicating.

Expected:

```text
Status classification matches the verified MyGeotab mechanism.
```

### Test Case 3

Large number of devices.

Expected:

```text
Data retrieval remains within API constraints.
```

### Test Case 4

Missing data.

Expected:

```text
The application does not incorrectly infer a status.
```

### Test Case 5

API failure.

Expected:

```text
User receives an understandable error.
```

### Test Case 6

Timezone.

Expected:

```text
Displayed timestamps are consistent with the defined report timezone.
```

### Test Case 7

PDF.

Expected:

```text
PDF values match the report preview.
```

---

# 27. Traceability

Every implementation change should be traceable.

Each development phase should document:

```text
Requirement
    ↓
Research
    ↓
API Evidence
    ↓
Design Decision
    ↓
Implementation
    ↓
Test
    ↓
Result
```

Example:

```text
Requirement:
Show Device Online / Offline

API Research:
[Verified MyGeotab documentation]

Data Source:
[Verified entity]

Calculation:
[Documented logic]

Implementation:
[Module/file]

Test:
[Database/test scenario]

Result:
PASS / FAIL / NEEDS VERIFICATION
```

---

# 28. Development Phases

## Phase 0 — Research & Architecture

Tasks:

- Research MyGeotab API
- Research MyGeotab Add-In
- Identify relevant entities
- Identify available KPI data
- Define architecture
- Define module structure
- Define PDF strategy
- Define security approach
- Define testing strategy

No feature implementation yet.

---

## Phase 1 — Device Online / Offline

Tasks:

- Implement Add-In foundation
- Connect to MyGeotab API
- Retrieve verified device status data
- Display summary
- Display device table
- Add basic filtering
- Generate report preview
- Print / Save as PDF
- Test
- Stabilize

---

## Phase 2 — Distance Utilization

Research first.

Then implement only after Phase 1 is stable.

---

## Phase 3 — Top Alerts

Research first.

Then implement only after Phase 2 is stable.

---

## Phase 4 — Fuel Consumption

Research first.

Then implement only after Phase 3 is stable.

---

## Future Phases

Additional modules will be added one at a time.

---

# 29. Success Criteria

The project is successful when:

1. The Add-In runs correctly inside MyGeotab.
2. Data is retrieved from the actual MyGeotab API.
3. KPI calculations are based on verified data.
4. No undocumented assumptions are used as facts.
5. Users can configure report modules.
6. Reports can be previewed.
7. Reports can be exported/printed as PDF.
8. New modules can be added without breaking existing modules.
9. The architecture can support different customer KPI requirements.
10. Each module has traceable research and testing documentation.

---

# 30. Non-Goals

The project is NOT intended to:

- Replace MyGeotab.
- Modify MyGeotab vehicle data.
- Invent KPI definitions.
- Automatically assume customer KPI formulas.
- Implement every KPI in a single release.
- Create unnecessary infrastructure.
- Hide uncertainty in API behavior.

---

# 31. Key Product Principle

The project follows this principle:

> **Reliable data first. Scalability second. Feature count third.**

One correctly implemented KPI is more valuable than ten unverified KPIs.

---

# 32. Current Development Status

```text
Phase 0 — Research & Architecture
STATUS: NOT STARTED

Phase 1 — Device Online / Offline
STATUS: NOT STARTED

Phase 2 — Distance
STATUS: PLANNED

Phase 3 — Top Alerts
STATUS: PLANNED

Phase 4 — Fuel
STATUS: PLANNED
```

---

# 33. Next Action

The next step is NOT implementation.

The next step is:

# PHASE 0 — MYGEOTAB RESEARCH

Research and verify:

1. MyGeotab Add-In architecture.
2. Add-In configuration format.
3. API access from Add-In.
4. Device status data.
5. `DeviceStatusInfo` and related API capabilities.
6. Online/offline definition.
7. Relevant permissions.
8. API limitations.
9. PDF generation options.
10. Scalable module architecture.

Only after this research is completed should implementation begin.
