# Geotab Fleet Report Generator

A **MyGeotab Add-In** that lets fleet teams configure and generate fleet monitoring reports (customer-specific KPI modules) as professional PDF reports.

**First module:** Device Online / Offline.

> Read `Documentation/PROJECT_CONTEXT.md` before working on this project. It defines the mandatory rules (research before code, no invented MyGeotab capabilities, traceability).

---

## Status

| Area | Status |
|---|---|
| Phase 0 — Research & Architecture | COMPLETE (2026-08-13) |
| Add-In scaffold + lifecycle | IMPLEMENTED |
| Device Online / Offline module | IMPLEMENTED (pending live DB test) |
| Online/Offline classification source | VERIFIED — `DeviceStatusInfo.IsDeviceCommunicating` |
| Live database test (R-008) | **PENDING** |
| PDF | Browser `print()` (library `NEEDS VERIFICATION`) |

## Verified MyGeotab facts (2026-08-13)

Sources: [developers.geotab.com](https://developers.geotab.com) — Developing Add-Ins, MyGeotab API reference.

- Add-In entry point: `geotab.addin.<name>` exposing `initialize(api, state, callback)`, `focus(api, state)`, `blur()`.
- The injected `api` object is authenticated as the signed-in user in the **active database context** — no database selector needed (ADR-001).
- `state.getGroupFilter()` returns the selected group ids of the MyGeotab organization filter.
- `DeviceStatusInfo` fields include `IsDeviceCommunicating`, `DateTime`, `Groups`, `IsDriving`, `Speed`, `Latitude`, `Longitude`, `ExceptionEvents`, `StatusData`.
- Group → device scope: `DeviceSearch.groups` accepts an array of Group references.
- `PropertySelector` is supported for `Device` and `Group`.
- API result limit: 50,000; `Get(DeviceStatusInfo)` rate limit 900/min (Inactive).

The full evidence log lives in `Documentation/Geotab_Fleet_Report_Generator_Data_Mapping_v0.1.md` §39.

## Directory layout

```
app/                  # The Add-In (host externally, reference from config)
  addin.html          # Add-In page (loaded by MyGeotab)
  css/addin.css       # Builder styles + @media print (PDF) styles
  scripts/
    main.js           # geotab.addin.fleetReportGenerator entry point
    core/             # frgBase, dateTime, errorHandler, apiClient, reportController
    modules/          # registry + deviceStatus module
    render/           # uiBuilder (Report Builder UI), reportRenderer (preview/PDF)
config/
  addin.json          # Add-In configuration file (install into MyGeotab)
dev/                  # LOCAL DEVELOPMENT ONLY (never deploy)
  index.html          # standalone page w/ mock sidebar
  bootstrap.js        # starts the Add-In with the mock api/state
  mock/               # fixtures.js, mockApi.js, mockState.js
  server.js           # zero-dependency static server
test/                 # zero-dependency Node test suite
```

## Local development

```bash
npm run dev        # starts http://localhost:8080
```

Open `http://localhost:8080/dev/index.html` in Chrome. The page runs the real Add-In code against a **mock MyGeotab API** backed by `dev/mock/fixtures.js`, so you can exercise the full report flow (group filter, module selection, generate, preview, print) without a MyGeotab account.

**Mock dataset highlights:** 8 devices across 3 groups; one device (`d-007`) intentionally has no status record and must be classified **Unknown** (never coerced into Offline).

## Tests

```bash
npm test           # node test/runTests.js
```

Covers the API client, error mapping, module classification, report controller (including per-module error isolation) and the report renderer. 22 tests, zero dependencies.

## Installing into MyGeotab

1. Host the `app/` folder on any HTTPS server (TLS 1.2+, publicly accessible). The URL must **not** contain `-`, `@` or `#` (verified requirement).
2. Edit `config/addin.json`:
   - `items[].url` → your hosted `addin.html` URL.
   - `items[].svgIcon` → a hosted SVG icon URL.
   - `supportEmail` → a real address.
3. In MyGeotab: **Administration → System → System Settings → Add-Ins → New Add-In**, paste the JSON, save, refresh.

## Open verification items

- **R-008 — live database test.** The classification rule (`IsDeviceCommunicating` true/false) and exact request/response shapes must be validated against a real MyGeotab database before the module is declared final.
- **PDF library.** The initial version prints via `window.print()` (A4 print styles in `addin.css`). A dedicated PDF library remains `NEEDS VERIFICATION`.
- **`fromDate` in `Device` search** appears in official samples; its effect on `Get(Device)` should be confirmed during R-008.

## Development rules

- Never invent MyGeotab behavior. Mark unverified items `NEEDS VERIFICATION` / `TBD`.
- New KPI modules go through: research → verify → document → module spec → implement → test.
- Every new module registers itself in the registry (`app/scripts/modules/registry.js`) and implements `fetch`, `process`, `renderSection`.
- No KPI module is implemented until its data lineage is documented.
