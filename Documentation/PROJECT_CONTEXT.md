# PROJECT CONTEXT
## Geotab Fleet Report Generator

**Document Version:** 0.1  
**Status:** Active Project Context  
**Purpose:** Shared context for all AI agents and developers working on this project.

---

# 1. Project Identity

**Project Name:** Geotab Fleet Report Generator

**Platform:** MyGeotab Add-In

**Primary Data Source:** MyGeotab API / supported MyGeotab Add-In API mechanisms

**Primary Goal:** Build a scalable MyGeotab Add-In that allows users to configure and generate fleet monitoring reports containing customer-specific KPI modules and output them as a professional report/PDF.

---

# 2. Core Product Concept

The application is a **modular report builder**.

Users select the KPI/report modules they need, configure the supported scope/filter parameters, preview the report, and generate the final report.

The application must be designed so that new KPI modules can be added independently.

Initial module:

- Device Online / Offline

Planned/future modules may include:

- Distance Utilization
- Top Alerts
- Fuel Consumption
- Idle Time
- Harsh Driving
- Geofence
- Engine Hours
- Other customer-specific KPIs

Future modules are examples only and must not be implemented until their MyGeotab data/API requirements have been researched and verified.

---

# 3. Critical Engineering Rule

## DO NOT INVENT MYGEOTAB CAPABILITIES

This is a mandatory rule for every AI agent.

Do not assume or fabricate:

- API entities
- API methods
- API properties
- API parameters
- API response structures
- Add-In configuration
- Add-In lifecycle behavior
- Authentication behavior
- Permissions
- API limits
- Pagination
- Data definitions
- PDF capabilities
- Database context behavior

If information has not been verified, explicitly mark it:

`NEEDS VERIFICATION`

or:

`TBD`

Do not present an assumption as a verified MyGeotab capability.

Research official MyGeotab documentation before making platform-specific implementation decisions.

---

# 4. Database Context Principle

The application is designed as a MyGeotab Add-In.

The Report Builder should operate against the active MyGeotab database context in which the Add-In is running.

The user should NOT manually select a database from the Report Builder.

Therefore the initial UI does not contain:

- Customer / Database selector
- Database switching control

Database/customer identity may be shown as automatically derived report metadata only if the available Add-In/API context has been verified.

Cross-database reporting is outside the initial scope.

---

# 5. Current Report Builder UI

Current Report Parameters:

- Vehicle Group
- Report Date

Removed from the initial UI:

- Customer / Database selector
- Timezone selector

The timezone should not be exposed as a user-configurable parameter unless a verified business requirement and verified technical/API behavior justify it.

---

# 6. Current Module

## Device Online / Offline

This is the first implementation module.

Its exact data source and Online/Offline definition must be verified against MyGeotab documentation/API behavior before implementation.

Potential report outputs must only use fields that are actually available and verified.

---

# 7. Scalability Principle

Every KPI must be implemented as an independent module.

Conceptually:

```text
Report Builder
      |
      +-- Device Status Module
      |
      +-- Distance Module
      |
      +-- Alerts Module
      |
      +-- Fuel Module
      |
      +-- Idle Module
      |
      +-- Future Modules
```

Adding a new module should not require rewriting unrelated modules.

Modules should have clear boundaries for:

1. Requirements
2. API/data requirements
3. Data retrieval
4. Data transformation
5. KPI calculation
6. Report section rendering
7. Testing

---

# 8. Development Philosophy

The project follows this order:

```text
Research
   ↓
Verify
   ↓
Document
   ↓
Design
   ↓
Implement
   ↓
Test
   ↓
Validate
```

Not:

```text
Guess
   ↓
Code
   ↓
Hope
```

---

# 9. Documentation Hierarchy

The project documentation should follow:

```text
PROJECT_CONTEXT.md
        ↓
PRD.md
        ↓
SRS.md
        ↓
Architecture / ADR
        ↓
Module Specifications
        ↓
Implementation
        ↓
Tests
```

Each AI agent should read `PROJECT_CONTEXT.md` before working on the project.

---

# 10. AI Agent Responsibilities

## Research Agent

Responsible for:

- MyGeotab documentation research
- API verification
- Add-In capability research
- Evidence collection
- Identifying unknowns

Must not invent missing information.

---

## Architecture Agent

Responsible for:

- System architecture
- Module boundaries
- Data flow
- Technical decisions
- Scalability

Must use verified research.

---

## Development Agent

Responsible for:

- Implementation
- Code structure
- UI
- API integration
- Module implementation

Must follow PRD, SRS, and verified research.

---

## Testing Agent

Responsible for:

- Unit tests
- Integration tests
- API behavior validation
- UI testing
- Report/PDF consistency
- Regression testing

Must test against defined requirements.

---

# 11. Current Project Phase

```text
Phase 0 — Research & Architecture     COMPLETE (research verified 2026-08-13)
Phase 1 — Device Online / Offline     IN PROGRESS (module scaffolded; R-008 live DB test pending)
```

Current implementation status:

```text
Add-In:
EARLY DEVELOPMENT — entry point, lifecycle, config scaffolded

Device Online / Offline:
IMPLEMENTATION STARTED — classification source VERIFIED
(IsDeviceCommunicating); live database test R-008 pending

API Verification:
PARTIALLY VERIFIED — see Data Mapping v0.1 verification log (2026-08-13)

PDF:
NEEDS VERIFICATION — initial version uses browser window.print()

Scalable Module Architecture:
DESIGN COMPLETE — modular registry implemented with first module
```

---

# 12. Important Current Decisions

### Decision 1 — Database Context

The Add-In uses the active MyGeotab database context.

No manual database selector in the Report Builder.

### Decision 2 — Vehicle Group

Vehicle Group is a primary report scope/filter.

Exact group API behavior must be verified.

### Decision 3 — Timezone

Timezone is not a user-configurable parameter in the initial UI.

### Decision 4 — Modular Reports

Each KPI is an independent report module.

### Decision 5 — Accuracy Before Speed

Unverified MyGeotab behavior must never be presented as fact.

---

# 13. Source of Truth Rules

When documents disagree:

1. Verified official MyGeotab documentation/data takes precedence for platform behavior.
2. Accepted Architecture Decision Records take precedence for project architecture.
3. SRS defines software requirements.
4. PRD defines product requirements.
5. Conversation history is not a substitute for documented decisions.

If a conflict is discovered, stop and document the conflict instead of silently choosing an assumption.

---

# 14. Change Rule

Any significant architectural decision must be documented in an ADR.

Any new KPI module must have its own module specification before implementation.

---

# 15. Current UI Concept

```text
MyGeotab
   |
   +-- Fleet Report Generator
          |
          +-- Report Parameters
          |      +-- Vehicle Group
          |      +-- Report Date
          |
          +-- Report Modules
          |      +-- Device Online / Offline
          |      +-- Future KPI modules
          |
          +-- Data Summary
          |
          +-- Report Preview
          |
          +-- PDF / Print Output
```

---

# 16. Final Rule for AI Agents

Before changing architecture, API logic, UI assumptions, or report behavior:

1. Read this document.
2. Read the relevant PRD/SRS section.
3. Check existing ADRs.
4. Verify MyGeotab-specific facts.
5. Identify anything uncertain.
6. Do not guess.
7. Document the decision/change.

**Accuracy, traceability, and scalability are more important than adding features quickly.**
