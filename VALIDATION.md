# VALIDATION.md

## Purpose
Define how each slice is validated before approval.
Validation is required before implementation moves forward.

## Slice Workflow
1. Define scope
2. Identify assumptions, ambiguities, dependencies, risks, and missing contracts
3. List touched files and why each must change
4. Define validation and acceptance criteria
5. Implement only after approval
6. Record validation evidence and handoff

## Validation Levels

### V0 — Documentation / Control Slice
Use for:
- control files
- architecture wording
- backlog/decision/interface updates

Required checks:
- internal consistency
- no implementation logic
- no hidden requirement invention
- correct separation of stable truth vs unresolved decisions
- exactly one active current task entry in `CURRENT_TASK.md`

### V1 — Contract / Interface Slice
Use for:
- interface definitions
- event shapes
- schema boundaries
- invariants
- dependency rules
- error categories

Required checks:
- no platform leakage into core contracts
- no transport/translation coupling
- invariants stated clearly
- unresolved items called out explicitly
- allowed and forbidden dependency rules are explicit

## VS Program Validation Map

### VS-PROG-001 — Control reset into vertical-slice program (this slice)
Validation level: **V0**

Required evidence:
- prior program history remains preserved (not erased)
- active execution program is explicit as `VS-*`
- current active task is `VS-01`
- VS sequence (`VS-01`..`VS-08`) is recorded and gap-linked (G-001..G-006)
- no runtime/firmware/workflow implementation files changed

### VS-01 — Runtime Data Plane Integration
Validation level: **V1 + integration evidence**

Required evidence:
- USB input -> decode/map -> profile encode -> BLE notify path is exercised
- malformed/unsupported reports are fail-safe and deterministic
- recovery/supervisor interactions remain bounded

### VS-02 — Firmware Config Transport Adapter
Validation level: **V1 + transport evidence**

Required evidence:
- serial framing/parser wired to `ConfigTransportService`
- protocol version/request-id/integrity rejection remains deterministic
- persist/load/clear/get_capabilities status/fault mapping remains lossless

### VS-03 — BLE Stack Callback Wiring Hardening
Validation level: **V1 + BLE evidence**

Required evidence:
- real callback registration/dispatch path is explicit
- report-channel ready/closed transitions validated
- bounded recovery and terminal fail-closed posture validated

### VS-04 — Startup Storage Lifecycle Hardening
Validation level: **V1 + startup evidence**

Required evidence:
- explicit `nvs_flash_init`-first startup behavior
- recoverable/unrecoverable startup paths are deterministic and documented

### VS-05 — Test Bootstrap Portability
Validation level: **V0 + build/test evidence**

Required evidence:
- clean environment test configure/build path succeeds without manual GTest install
- local and CI bootstrap guidance are aligned

### VS-06 — Web Runtime Consolidation
Validation level: **V0 + web QA evidence**

Required evidence:
- one canonical runtime tree is declared and enforced
- non-canonical tree archived/removed with no operator ambiguity

### VS-07 — End-to-End Hardware Validation Pack
Validation level: **PROD4-style evidence package**

Required evidence:
- scenario matrix for flash/monitor/config/BLE and failure/recovery
- build/artifact traceability for each executed scenario

### VS-08 — Release, Rollback, and Production Gate Closure
Validation level: **PROD4-style final gate review**

Required evidence:
- release integrity/provenance verification
- rollback rehearsal pass evidence
- sign-off matrix and explicit ship/no-ship record

## Contract Approval Gate
Implementation must not begin until all items below are explicitly approved or explicitly deferred.

### Architecture Alignment
- ARCHITECTURE.md and INTERFACES.md do not conflict.
- No stable architecture truth has been replaced with implementation detail.

### Slice Readiness Approval
- `CURRENT_TASK.md` reflects exactly one active task entry.
- `TODO.md` identifies the next implementation slice as a narrow task.
- Touched files for the slice are listed before coding.
- Validation evidence required for the slice is defined before coding.

### Scope-Control Approval
- No unrelated concerns are merged into one slice.
- Blocked items are labeled explicitly as blocked.
