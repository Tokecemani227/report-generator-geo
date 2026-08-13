# ARCHITECTURE DECISION RECORDS
## Geotab Fleet Report Generator

---

# ADR-001 — Active MyGeotab Database Context

**Status:** Accepted  
**Date:** 2026-08-13  
**Decision:** Use the active MyGeotab database context for the Add-In.

## Context

The application is being developed as a MyGeotab Add-In rather than as an independent multi-database application.

The Report Builder therefore should not ask the user to manually choose a MyGeotab database.

## Decision

The initial Report Builder will not contain a:

- Customer selector
- Database selector
- Database switching control

The Add-In shall operate within the active MyGeotab database context.

## Important Verification Requirement

The exact mechanism by which the Add-In/API exposes or identifies the active database must be verified against official MyGeotab documentation.

The project must not assume a particular API property or Add-In object.

## Consequences

### Positive

- Simpler UI
- Lower risk of cross-database data mixing
- More natural Add-In experience
- Clear database scope

### Negative / Limitation

- Initial version does not support cross-database reporting
- Multi-database reporting would require a separate architecture

---

# ADR-002 — Modular KPI Architecture

**Status:** Accepted  
**Date:** 2026-08-13  
**Decision:** Implement each KPI as an independent report module.

## Context

Different customers may have different KPI requirements.

A monolithic report implementation would become difficult to maintain as KPI requirements grow.

## Decision

Each KPI shall have an independent module boundary.

Example:

```text
Device Status
Distance
Alerts
Fuel
Idle
...
```

Each module is responsible for its own:

- Requirements
- Data requirements
- API retrieval
- Data processing
- KPI calculations
- Report rendering
- Tests

## Consequences

Adding a new KPI should not require rewriting unrelated KPI modules.

---

# ADR-003 — No Unverified MyGeotab Assumptions

**Status:** Accepted  
**Date:** 2026-08-13  
**Decision:** Platform-specific facts must be verified before implementation.

## Context

Incorrect assumptions about MyGeotab entities, API methods, properties, Add-In behavior, or data definitions could produce incorrect reports.

## Decision

Any unverified platform behavior must be marked:

`NEEDS VERIFICATION`

The team must research official documentation or other appropriate evidence before treating it as a confirmed implementation requirement.

## Consequences

Development may occasionally pause while API behavior is researched.

This is intentional.

Accuracy takes precedence over implementation speed.
