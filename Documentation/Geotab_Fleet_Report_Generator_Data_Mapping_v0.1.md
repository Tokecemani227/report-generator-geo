# Geotab Fleet Report Generator — Data Mapping & Data Architecture

**Document Version:** 0.1  
**Status:** Draft / Research-Based  
**Date:** 2026-08-13  
**Scope:** Foundation + Device Online/Offline module  
**Primary Platform:** MyGeotab Add-In  
**Primary API:** MyGeotab SDK/API

---

# 1. Purpose

This document defines the data mapping required to begin implementation of the Geotab Fleet Report Generator.

The objective is to establish, **before coding**, exactly:

- what business information the report needs;
- which MyGeotab entities may provide that information;
- which fields are required;
- which fields are directly available;
- which relationships must be resolved;
- which values require calculation;
- which values are display-only;
- which assumptions are still unverified;
- what filters affect the data;
- how the data should flow into report modules;
- how the design remains scalable for future KPI modules.

This document intentionally separates:

```text
VERIFIED
    ↓
supported by current MyGeotab documentation/evidence

NEEDS VERIFICATION
    ↓
not sufficiently confirmed yet

DERIVED
    ↓
calculated by our application from verified data

DISPLAY
    ↓
presentation field, not an independent API source
```

---

# 2. Accuracy Rule

This document must never be treated as permission to invent API fields.

A field is considered **VERIFIED** only when it is supported by an appropriate MyGeotab source or validated directly against the target database/API.

If an exact property, entity behavior, search object, or Add-In context mechanism is not confirmed, it remains:

`NEEDS VERIFICATION`

This is especially important for:

- Online/Offline classification
- Device last communication timestamp
- Vehicle Group filtering semantics
- Add-In session/database context
- PDF generation mechanism
- Historical status behavior

---

# 3. Current Architecture

```text
MyGeotab Database
       │
       ▼
MyGeotab Add-In
       │
       ▼
API Access / Add-In Context
       │
       ▼
Data Access Layer
       │
       ├── Device
       ├── Group
       ├── DeviceStatusInfo
       ├── [Future entities]
       │
       ▼
Normalization Layer
       │
       ▼
Report Module
       │
       ├── Device Status
       ├── Future KPI Modules
       │
       ▼
Report Data Model
       │
       ▼
Renderer
       │
       ├── Preview
       └── PDF / Print
```

---

# 4. Important MyGeotab API Facts Currently Verified

The current MyGeotab SDK documentation confirms that:

1. MyGeotab exposes entities through its API.
2. The `Get` method is used to retrieve entities.
3. `GetCountOf` is available for counting matching entities.
4. API requests use JSON/JSON-RPC.
5. API requests are made over HTTPS.
6. API entities use opaque IDs.
7. Nested entities are generally returned as references/IDs rather than fully populated child objects.
8. `PropertySelector` can reduce returned fields for supported entities, including `Device` and `Group`.
9. `ExecuteMultiCall` can combine multiple API calls.
10. API dates are exchanged using ISO 8601 and converted to UTC.
11. MyGeotab generally returns metric units.
12. API result/rate limits must be respected.
13. `GetFeed` is intended for incremental synchronization and is not automatically the correct mechanism for every report.
14. As of July 2026, high-volume `GetFeed` calls for `StatusData`, `LogRecord`, `Trip`, and `DebugData` using `DeviceId` filtering are rejected; date-range `Get` is recommended for device-specific queries where applicable.

Sources:

- MyGeotab SDK — Concepts / API behavior: https://geotab.github.io/sdk/software/guides/concepts/
- MyGeotab SDK — Data Feed: https://geotab.github.io/sdk/software/guides/data-feed/
- MyGeotab SDK — API Clients: https://geotab.github.io/sdk/software/api/clients/
- MyGeotab release notes: https://support.geotab.com/mygeotab/doc/release-notes

---

# 5. Entity Relationship Model

The first module should conceptually use:

```text
Group
  │
  │ group membership / relationship
  ▼
Device
  │
  │ current status / current device information
  ▼
DeviceStatusInfo
  │
  ▼
Normalized Device Status
  │
  ▼
Device Status Report
```

Important:

The exact relationship fields and the exact status properties must be verified against the current API reference before implementation.

---

# 6. Core Entity Mapping

## 6.1 Device

### Business purpose

Represents a vehicle/device record used to identify the fleet asset.

### Verified information

The MyGeotab API documentation demonstrates the `Device` entity and examples containing properties such as:

- `id`
- `name`
- `serialNumber`
- `deviceType`
- `vehicleIdentificationNumber`

The exact fields needed by this project must still be selected deliberately.

### Required fields for first module

| Field | Purpose | Status |
|---|---|---|
| `id` | Stable internal entity reference | VERIFIED |
| `name` | Vehicle/device display name | VERIFIED |
| `serialNumber` | Device identification when needed | VERIFIED |
| `vehicleIdentificationNumber` | VIN display when required | VERIFIED |
| `deviceType` | Device type if required | VERIFIED |
| Group relationship | Vehicle Group filter/display | NEEDS VERIFICATION |

### Recommended initial API selection

Do not retrieve every Device property unless needed.

The SDK documentation supports `PropertySelector` for `Device`.

Initial candidate fields:

```text
id
name
serialNumber
vehicleIdentificationNumber
deviceType
```

Group-related fields should be added only after the exact relationship behavior is verified.

---

# 7. Group

## 7.1 Business purpose

Provides the vehicle-group scope used by the Report Builder.

### Required business operations

The module eventually needs to support:

```text
All Groups
      OR
Specific Group
```

### Required data

| Field | Purpose | Status |
|---|---|---|
| `id` | Group identity | VERIFIED |
| `name` | Group display name | VERIFIED |
| Parent/child relationship | Group hierarchy | NEEDS VERIFICATION |
| Device membership relationship | Filter devices by group | NEEDS VERIFICATION |

### Important design decision

The UI should not assume that a device belongs to exactly one group.

MyGeotab supports group structures and the exact membership behavior must be handled according to the verified API model.

---

# 8. DeviceStatusInfo

## 8.1 Business purpose

`DeviceStatusInfo` is documented by Geotab as an API entity used to obtain current device information; an official SDK example retrieves a `DeviceStatusInfo` object after retrieving a `Device`.

**Status:** VERIFIED on 2026-08-13 against the official API reference (developers.geotab.com/myGeotab/apiReference/objects/DeviceStatusInfo/).

### Verified properties (2026-08-13)

Source: https://developers.geotab.com/myGeotab/apiReference/objects/DeviceStatusInfo/

| Property | Meaning | Report Use |
|---|---|---|
| `Bearing` | Current heading in degrees | Future / display |
| `CurrentStateDuration` | Duration since last Trip state change | Future |
| `DateTime` | Most recent timestamp of latest status, GPS or fault data | Last Communication |
| `Device` | The Device this DeviceStatusInfo belongs to (reference) | Join key |
| `Driver` | Driver associated to current Device (reference) | Future |
| `ExceptionEvents` | Currently active ExceptionEvents | Future module |
| `Groups` | Groups the Device currently belongs to (references) | Group column |
| `IsDeviceCommunicating` | Whether the Device is communicating | **Online/Offline source** |
| `IsDriving` | Whether the current Device state is driving (else stopped) | Future / display |
| `Latitude` | Current latitude | Future / display |
| `Longitude` | Current longitude | Future / display |
| `Speed` | Current vehicle speed | Future / display |
| `StatusData` | Latest StatusData records for the current Device | Future modules |

### Verified search object (2026-08-13)

Source: https://developers.geotab.com/myGeotab/apiReference/objects/DeviceStatusInfoSearch/

`DeviceStatusInfoSearch` supports:

- `deviceSearch` — by `Id` or by `Groups` (Group references). Includes archived and deleted devices.
- `diagnostics` — list of diagnostics for latest values (max 200).
- `includeUntrackedDevices` — defaults `false`; include untracked/archived devices when `true`.
- `position` / `closestAssetLimit` — proximity search (not needed here).
- `userSearch` — by user `Id`.

This means the **Group → Device → status** filter can be resolved in a single `Get(DeviceStatusInfo)` call using `deviceSearch.groups`.

### Current mapping

| Business Need | Entity | Exact Field | Status |
|---|---|---|---|
| Current device status | DeviceStatusInfo | `IsDeviceCommunicating` | VERIFIED |
| Current location | DeviceStatusInfo | `Latitude` / `Longitude` | VERIFIED |
| Last data timestamp | DeviceStatusInfo | `DateTime` | VERIFIED |
| Current speed | DeviceStatusInfo | `Speed` | VERIFIED |
| Driving state | DeviceStatusInfo | `IsDriving` | VERIFIED |
| Group membership | DeviceStatusInfo | `Groups` | VERIFIED |

### Important

There is **no** `DeviceStatusInfo.status` property. The Online/Offline classification is derived from the verified `IsDeviceCommunicating` boolean.

---

# 9. Online / Offline Data Mapping

This is the most important mapping for the first implementation.

## 9.1 Business Requirement

The report needs to show:

```text
Total Devices
Online Devices
Offline Devices
Online %
Offline %
Device Detail
```

However, these are not automatically equivalent to arbitrary API fields.

---

## 9.2 Mapping

| Report Field | Source | Transformation | Status |
|---|---|---|---|
| Total Devices | Device | Count after scope filter | VERIFIED |
| Online Devices | DeviceStatusInfo.IsDeviceCommunicating = true | Count classified Online | VERIFIED |
| Offline Devices | DeviceStatusInfo.IsDeviceCommunicating = false | Count classified Offline | VERIFIED |
| Unknown Devices | No DeviceStatusInfo row for a scoped Device | Count with no status record | DERIVED |
| Online % | Online + Total | Online / Total × 100 | DERIVED |
| Offline % | Offline + Total | Offline / Total × 100 | DERIVED |
| Vehicle Name | Device.name | Direct mapping | VERIFIED |
| Device ID | Device.id | Direct mapping | VERIFIED |
| Serial Number | Device.serialNumber | Direct mapping | VERIFIED |
| VIN | Device.vehicleIdentificationNumber | Direct mapping | VERIFIED |
| Last Communication | DeviceStatusInfo.DateTime | Direct mapping/normalization | VERIFIED |
| Group | DeviceStatusInfo.Groups → Group.name | Lookup map join | VERIFIED |

---

# 10. Critical Online/Offline Decision

**RESOLVED on 2026-08-13.**

The official API reference defines `DeviceStatusInfo.IsDeviceCommunicating` as "a value indicating whether the Device is communicating." This is the verified Online/Offline source.

The correct sequence has been completed:

```text
Find official MyGeotab definition        → DONE (IsDeviceCommunicating)
Identify exact API source                → DONE (DeviceStatusInfo)
Identify exact field(s)                  → DONE (IsDeviceCommunicating)
Test against real database               → PENDING (R-008, requires a real database)
Document classification rule             → DONE (below)
Implement                                → IN PROGRESS
```

### Verified classification rule (candidate — pending database test R-008)

```text
IsDeviceCommunicating == true   → Online
IsDeviceCommunicating == false  → Offline
No DeviceStatusInfo record      → Unknown
```

Unknown devices (no status record at all) are reported separately so missing data is never silently converted to `false`.

Current status:

```text
ONLINE/OFFLINE SOURCE = VERIFIED (DeviceStatusInfo.IsDeviceCommunicating)
DB TEST = PENDING (R-008)
```

---

# 11. Report Scope Mapping

The Report Builder currently has:

```text
Vehicle Group
Report Date
```

But these parameters do not necessarily apply identically to every KPI module.

This distinction is important for scalability.

---

## 11.1 Vehicle Group

### UI

```text
Vehicle Group
[ All Groups ▼ ]
```

### Data flow

```text
Selected Group
      ↓
Group entity
      ↓
Resolve applicable devices
      ↓
Device scope
      ↓
Selected KPI module
```

### Status

**VERIFIED on 2026-08-13.**

- `DeviceSearch.groups` accepts an array of Group references to filter devices by group (verified via DeviceStatusInfoSearch docs and the official `startStop` sample Add-In which calls `Get(Device)` with `search: { groups: state.getGroupFilter() }`).
- `state.getGroupFilter()` returns the array of selected Group ids from the MyGeotab organization filter (verified in Developing Add-Ins documentation — page state methods).

The Add-In will resolve the device scope using the active organization filter via `state.getGroupFilter()`.

---

# 12. Report Date Mapping

The UI contains:

```text
Report Date
```

This must not automatically be applied to every API call.

Why?

Different KPI modules have different temporal semantics.

Examples:

| Module | Time behavior |
|---|---|
| Current Device Status | May represent current state rather than historical date |
| Trip | Historical interval |
| Exception Event | Historical interval |
| StatusData | Historical interval |
| Fuel | Historical interval |
| Current location | Current state |

Therefore:

> `Report Date` is a report-level parameter, but each module must declare whether and how it uses it.

---

# 13. Module Time Requirement Contract

Each module should eventually define:

```text
timeMode
```

Conceptual values:

```text
CURRENT
DATE_RANGE
NO_TIME_FILTER
CUSTOM
```

Example:

```text
Device Status
timeMode = CURRENT

Trip Report
timeMode = DATE_RANGE

Fuel Report
timeMode = DATE_RANGE
```

These values are architectural concepts, not MyGeotab API properties.

---

# 14. Device Status Module Data Contract

The normalized module should produce an internal structure similar to:

```javascript
{
    deviceId: "...",
    deviceName: "...",
    serialNumber: "...",
    vin: "...",

    groupIds: [],
    groupNames: [],

    status: "...",
    lastCommunication: "...",

    reportScope: {
        groupId: "...",
        reportDate: "..."
    }
}
```

Important:

The property names above are **internal application model proposals**, not claims about MyGeotab API response fields.

The module adapter is responsible for mapping verified API fields into this normalized structure.

---

# 15. Why Normalization Is Required

Without normalization:

```text
MyGeotab API
     ↓
Report UI
     ↓
PDF
```

every report component becomes dependent on raw API structures.

With normalization:

```text
MyGeotab API
     ↓
API Adapter
     ↓
Normalized Data Model
     ↓
KPI Module
     ↓
Report Model
     ↓
Renderer
```

This allows API-specific changes to remain isolated.

---

# 16. Lookup / Join Strategy

MyGeotab uses entity references rather than automatically returning fully populated nested entities.

Therefore the application should use lookup maps where appropriate.

Conceptual example:

```text
Device:
{
    id: D001,
    name: "Truck 01"
}

Group:
{
    id: G001,
    name: "Delivery"
}

Membership relationship:
D001 → G001
```

Normalized result:

```text
Truck 01 → Delivery
```

The exact membership representation must be verified.

---

# 17. API Call Strategy

The first module should minimize unnecessary calls.

Potential logical sequence:

```text
1. Resolve available groups
2. Resolve selected device scope
3. Retrieve required device fields
4. Retrieve verified current status source
5. Normalize
6. Calculate KPIs
7. Render
```

However, the exact number and ordering of API requests must be decided after testing the verified API behavior.

---

# 18. PropertySelector

The SDK documentation confirms that `PropertySelector` supports `Device` and `Group`.

This should be considered for reducing payload size.

Example conceptual selection:

```text
Device:
    id
    name
    serialNumber
    vehicleIdentificationNumber
```

Do not request unused properties by default.

This is particularly important when the fleet contains hundreds or thousands of devices.

---

# 19. GetCountOf

The API provides `GetCountOf`.

This may be useful for count-only operations.

However, the application must be careful not to create inconsistent results by:

```text
GetCountOf → one point in time
Get       → another point in time
```

If the report requires counts and detailed rows to represent exactly the same dataset snapshot, the implementation should consider retrieving and deriving counts from the same normalized result when practical.

The final strategy should be validated during implementation.

---

# 20. MultiCall

The API supports `ExecuteMultiCall`.

This can reduce HTTP round trips when multiple relatively small calls are required.

However, MultiCall should not be used blindly.

The SDK documentation recommends limiting nested requests for optimal performance and notes that long-running/large-response calls may be better handled separately.

Therefore:

```text
Small related lookups
    → MultiCall candidate

Large historical datasets
    → Evaluate separately
```

---

# 21. Data Feed

`GetFeed` is designed for incremental synchronization.

It should not automatically be selected simply because it is scalable.

For this report generator, the correct mechanism depends on the module:

```text
Current report
    → likely point-in-time Get / current-state API

Historical KPI
    → date-range Get or appropriate historical mechanism

Continuous synchronization
    → GetFeed candidate
```

This must be decided per module.

A recent Geotab release note also states that `GetFeed` calls on high-volume `StatusData`, `LogRecord`, `Trip`, and `DebugData` using DeviceId filtering are rejected; device-specific historical queries should instead use `Get` with a date range where appropriate.

---

# 22. Date/Time Mapping

The API documentation specifies ISO 8601 date/time handling and conversion to UTC.

Therefore the application should establish a central time utility.

Conceptual flow:

```text
User Report Date
       ↓
Application Date Boundary
       ↓
Convert to UTC
       ↓
MyGeotab API
       ↓
Normalize
       ↓
Display/report formatting
```

The exact database-local boundary behavior must be tested.

Do not hard-code:

```text
UTC+7
```

because the application is intended to be scalable across customers/databases.

---

# 23. Units Mapping

MyGeotab generally returns metric values such as:

- distance in meters
- speed in km/h

The report renderer may convert values for display.

The conversion layer should be centralized.

Example:

```text
API:
distance = meters

Internal:
distanceMeters

Report:
distanceKm
```

Do not store converted values as if they were raw API values.

---

# 24. Report-Level Data Model

The report should be independent of individual API entities.

Conceptual model:

```javascript
{
    metadata: {
        generatedAt: "...",
        reportDate: "...",
        databaseContext: "...",
        selectedGroup: "..."
    },

    scope: {
        groupIds: [],
        deviceIds: []
    },

    sections: [
        {
            moduleId: "device-status",
            title: "Device Online / Offline",
            data: {}
        }
    ]
}
```

This is an internal design proposal.

---

# 25. Module Data Mapping Template

Every future KPI module must create a mapping table like this:

| Business Metric | Entity | API Method | Search | Raw Field | Transformation | Output Field | Status |
|---|---|---|---|---|---|---|---|
| Example | TBD | TBD | TBD | TBD | TBD | TBD | NEEDS VERIFICATION |

No module should move directly from business idea to code.

---

# 26. Future KPI Mapping — Initial Research Matrix

These are **candidate mappings only** and are not implementation approvals.

| KPI Module | Candidate Entity/Source | Time Scope | Main Risk | Status |
|---|---|---|---|---|
| Device Online/Offline | Device / DeviceStatusInfo / verified status source | Current | Exact status definition | NEEDS VERIFICATION |
| Distance Utilization | Trip / LogRecord | Date range | Business definition | NEEDS VERIFICATION |
| Top Alerts | ExceptionEvent / Rule | Date range | Rule/event semantics | NEEDS VERIFICATION |
| Fuel Consumption | FuelUsed / FillUp / FuelTransaction / StatusData | Date range | Data availability and calculation | NEEDS VERIFICATION |
| Idle Time | StatusData / Trip / diagnostic-related data | Date range | Exact definition | NEEDS VERIFICATION |
| Harsh Events | ExceptionEvent / Rule | Date range | Rule configuration | NEEDS VERIFICATION |
| Geofence | Zone / ZoneLog / related events | Date range | Exact event source | NEEDS VERIFICATION |
| Engine Hours | StatusData / DeviceStatusInfo / relevant source | Date range/current | Diagnostic mapping | NEEDS VERIFICATION |

These candidates are informed by the currently available MyGeotab entity documentation and must be individually researched before implementation.

---

# 27. Customer KPI Configuration

The application is intended to support different customer KPI requirements.

Therefore KPI configuration should eventually be separated from raw API mapping.

Conceptually:

```text
Customer Report Profile
       ↓
Selected Modules
       ↓
Module Configuration
       ↓
Data Requirements
       ↓
API Retrieval
       ↓
Report
```

However, customer-profile persistence and configuration are future scope.

Do not build a complex customer configuration system into the first Device Status module unless a verified requirement exists.

---

# 28. Data Lineage

Every displayed KPI should be traceable.

Example:

```text
PDF:
Online Devices = 119
        │
        ▼
Device Status Module
        │
        ▼
Normalized Device Status
        │
        ▼
Verified MyGeotab status source
        │
        ▼
API request
        │
        ▼
MyGeotab database
```

For debugging, the system should be able to identify:

- module;
- source entity;
- request scope;
- calculation;
- report field.

---

# 29. Data Quality Rules

## Rule DQ-001

Do not convert missing data into zero automatically.

Bad:

```text
missing → 0
```

Correct:

```text
missing → N/A / Unknown
```

unless the business definition explicitly states that missing means zero.

---

## Rule DQ-002

Do not silently discard API records.

If records are excluded due to:

- invalid data;
- missing relationship;
- unsupported status;
- filtering;

the behavior should be documented.

---

## Rule DQ-003

Do not infer business meaning from field names alone.

Example:

```text
"status"
```

does not automatically mean:

```text
Online / Offline
```

---

# 30. API Error Mapping

The data layer should map API failures into application-level errors.

Conceptual:

```text
MyGeotab API
      ↓
API Error
      ↓
Error Adapter
      ↓
Application Error
      ↓
UI Message
```

Possible categories:

```text
AUTHENTICATION_ERROR
PERMISSION_ERROR
RATE_LIMIT_ERROR
OVER_LIMIT_ERROR
NETWORK_ERROR
INVALID_REQUEST
UNKNOWN_API_ERROR
```

Exact mapping must follow verified API error structures.

---

# 31. Security Data Mapping

The application must distinguish:

```text
User session/context
      ↓
API access
      ↓
Fleet data
```

Do not expose:

- passwords;
- session credentials;
- service account secrets;

in report output or normal browser logs.

If a backend/service account is introduced later, it must be documented separately.

Geotab documentation states that service accounts are used for API access outside active user sessions and have specific security/credential handling requirements. This is not required for the first module unless the architecture needs it.

---

# 32. Database Context Mapping

The report should conceptually derive:

```text
Active MyGeotab Context
        ↓
API Session / Add-In Context
        ↓
Current Database
        ↓
Device / Group / KPI Data
```

The exact Add-In context API mechanism is still:

`NEEDS VERIFICATION`

Therefore the implementation must not hard-code a database name or assume that a particular JavaScript object/property contains it.

---

# 33. Initial Device Status Data Pipeline

The first implementation should follow:

```text
┌─────────────────────┐
│ MyGeotab Add-In     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Active DB Context   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Select Group        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Resolve Device      │
│ Scope                │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Retrieve Required   │
│ Device Data         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Retrieve Verified   │
│ Status Data         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Normalize           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Calculate KPI       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Report Section      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Preview / PDF       │
└─────────────────────┘
```

---

# 34. Data Mapping Status

| Area | Status |
|---|---|
| Device entity existence | VERIFIED |
| Device ID | VERIFIED |
| Device name | VERIFIED |
| Serial number | VERIFIED |
| VIN | VERIFIED |
| Device type | VERIFIED |
| Group entity existence | VERIFIED |
| Group ID/name | VERIFIED |
| Group filter → device scope (search.groups + state.getGroupFilter) | VERIFIED |
| DeviceStatusInfo existence/use | VERIFIED |
| Online/Offline source (`IsDeviceCommunicating`) | VERIFIED |
| Last communication (`DeviceStatusInfo.DateTime`) | VERIFIED |
| Group column (`DeviceStatusInfo.Groups`) | VERIFIED |
| Current DB/Add-In context mechanism (host API injected to Add-In) | VERIFIED |
| Report date semantics for current status (`timeMode = CURRENT`) | VERIFIED (conceptual) |
| Real-database validation of classification | PENDING (R-008) |
| PDF mechanism | NEEDS VERIFICATION |

---

# 35. Research Task Status

The research tasks were executed on 2026-08-13. Most are now resolved:

| Task | Description | Status |
|---|---|---|
| R-001 | Verify the MyGeotab Add-In API/context mechanism | RESOLVED — Add-In receives `api` + `state` in lifecycle methods |
| R-002 | How the active database/session is exposed to an Add-In | RESOLVED — host injects signed-in `api` object; `api.getSession` available; no manual DB selection needed |
| R-003 | Exact API object used for current device status | RESOLVED — `DeviceStatusInfo` |
| R-004 | Exact properties of that object | RESOLVED — see section 8 verified property table |
| R-005 | Official Online vs Offline interpretation | RESOLVED — `IsDeviceCommunicating` boolean |
| R-006 | Last communication timestamp source | RESOLVED — `DeviceStatusInfo.DateTime` |
| R-007 | Group → Device filtering/search behavior | RESOLVED — `search.groups` on DeviceSearch + `state.getGroupFilter()` |
| R-008 | Test the API against an actual target MyGeotab database | **PENDING** — requires a real database |
| R-009 | Document exact request/response shape | RESOLVED — see section 36 evidence table |
| R-010 | Implement the module after R-001–R-009 resolved | IN PROGRESS — only R-008 (live DB test) remains |

**Note:** R-008 requires access to a real MyGeotab database and is the single remaining gate before the module can be declared fully validated. The implementation is designed so the verified API behavior is exercised through a single adapter that can be swapped when live testing is available.

---

# 36. Evidence Requirement

For every verified field, the project should record:

```text
Entity
API Method
Property
Purpose
Source
Tested Against Database?
Observed Response?
Notes
```

Example:

```text
Entity: Device
API Method: Get
Property: id
Purpose: Device identifier
Source: MyGeotab SDK API documentation
Tested: YES/NO
Observed: YES/NO
Notes: Opaque identifier
```

---

# 37. Definition of Done — Data Mapping

The Device Status data mapping is complete only when:

- [ ] Active database context is verified.
- [ ] Device entity mapping is verified.
- [ ] Group mapping is verified.
- [ ] Device/group relationship is verified.
- [ ] Current status source is verified.
- [ ] Online/Offline semantics are verified.
- [ ] Last communication field is verified if required.
- [ ] Exact API requests are documented.
- [ ] Exact response fields are documented.
- [ ] Report calculations are documented.
- [ ] Missing-data behavior is documented.
- [ ] Error behavior is documented.
- [ ] At least one real database test is completed.
- [ ] No `NEEDS VERIFICATION` item remains in the critical path.

---

# 38. Source References

Primary references used for this mapping:

1. **Geotab Developers — MyGeotab SDK**
   https://geotab.github.io/sdk/

2. **Geotab Developers — Concepts / API**
   https://geotab.github.io/sdk/software/guides/concepts/

3. **Geotab Developers — Data Feed**
   https://geotab.github.io/sdk/software/guides/data-feed/

4. **Geotab Developers — API Clients**
   https://geotab.github.io/sdk/software/api/clients/

5. **Geotab Developers — API Reference**
   https://geotab.github.io/sdk/software/api/reference/

6. **Geotab Developer Example — Get Device Location**
   https://geotab.github.io/sdk/software/js-samples/getLocation.html

7. **Geotab Support — Device Reports**
   https://support.geotab.com/help/mygeotab/reports/productivity-reports/device-reports

8. **Geotab Support — Device Management**
   https://support.geotab.com/help/mygeotab/device-management

9. **Geotab MyGeotab & Drive Release Notes**
   https://support.geotab.com/mygeotab/doc/release-notes

---

# 39. Final Principle

The data mapping is the bridge between:

```text
Business KPI
      ↓
MyGeotab API
      ↓
Application Data Model
      ↓
Report
```

If that bridge is wrong, the report can look professional while producing incorrect numbers.

Therefore:

> **No KPI module should be implemented until its data lineage is understood and documented.**

---

# 39. Verification Log — 2026-08-13

This log records the evidence collected during Phase 0 research. Each entry follows the evidence format required in section 36.

| # | Entity | API Method | Property/Behavior | Purpose | Source | Tested | Observed |
|---|---|---|---|---|---|---|---|
| V-001 | DeviceStatusInfo | Get | `IsDeviceCommunicating` | Online/Offline source | developers.geotab.com API reference | NO | NO |
| V-002 | DeviceStatusInfo | Get | `DateTime` | Last communication timestamp | developers.geotab.com API reference | NO | NO |
| V-003 | DeviceStatusInfo | Get | `Groups` | Group column (current membership) | developers.geotab.com API reference | NO | NO |
| V-004 | DeviceStatusInfo | Get | `IsDriving`, `Speed`, `Latitude`, `Longitude`, `Bearing`, `CurrentStateDuration`, `ExceptionEvents`, `StatusData`, `Driver`, `Device` | Full verified property set | developers.geotab.com API reference | NO | NO |
| V-005 | DeviceStatusInfoSearch | Get | `deviceSearch.id`, `deviceSearch.groups`, `diagnostics`, `includeUntrackedDevices` | Search contract | developers.geotab.com API reference | NO | NO |
| V-006 | DeviceStatusInfo | Get | 900 req/1m limit (Inactive), result limit 50000 | Rate limits | developers.geotab.com API reference | NO | NO |
| V-007 | Device | Get | `search.groups`, `resultsLimit`, PropertySelector support | Group-based device scope | official startStop sample Add-In + SDK docs | NO | NO |
| V-008 | Add-In | n/a | Entry `geotab.addin.<name>`, lifecycle `initialize(api,state,cb)`, `focus(api,state)`, `blur()` | Add-In contract | Developing Add-Ins (MyGeotab) | NO | NO |
| V-009 | Add-In state | n/a | `state.getGroupFilter()` returns selected group ids | Active organization filter | Developing Add-Ins (MyGeotab) | NO | NO |
| V-010 | Add-In config | n/a | JSON keys: `name`, `supportEmail`, `version`, `items`, `files`, `isSigned` | Configuration schema | Developing Add-Ins (MyGeotab) | NO | NO |
| V-011 | API | Authenticate | Session token flow, credentials `{database, userName, sessionId}` | Auth model | SDK Concepts | NO | NO |

**Legend:** `Tested` = verified against a real database; `Observed` = live response captured. Both remain NO until R-008 (live database test) is executed.

## Add-In integration facts verified (source: Developing Add-Ins, MyGeotab)

1. An Add-In is JavaScript, HTML and CSS loaded inside MyGeotab.
2. Source code is hosted externally and referenced via the configuration file `items[].url`.
3. Configuration file is a JSON document with keys `name`, `supportEmail`, `version`, `items`/`files`, `key`, `signature`, `enableViewSecurityId`, `securityIds`.
4. A custom page Add-In defines a namespace object `geotab.addin.<name>` (no hyphens) exposing:
   - `initialize(api, state, callback)` — called once; call `callback()` when ready.
   - `focus(api, state)` — called after UI load and when the global group filter changes.
   - `blur()` — called when navigating away.
5. The injected `api` object is authenticated as the signed-in user and operates in the active database context — no database selector is required (confirms ADR-001).
6. The injected `state` object exposes `getGroupFilter()`, `getState()`, `setState()`, `gotoPage()`, `hasAccessToPage()`, `translate()`.
7. Menu placement is controlled by `items[].path` relative to built-in menu entries (e.g. `ActivityLink`, `ZoneAndMessagesLink`, `RuleAndGroupsLink`, `AdministrationLink`) or via `category` for the redesigned navigation menu.

## Open items

- R-008 — live database test of the classification rule and request shapes.
- PDF mechanism remains `NEEDS VERIFICATION` (browser `window.print()` is used for the initial version; a dedicated PDF library is not yet committed).
- `fromDate` in `Device` search appears in the official sample; its exact effect on `Get(Device)` should be confirmed during R-008 before relying on it.
