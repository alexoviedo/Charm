# TODO.md

## Purpose
Prioritized backlog of narrow, reviewable slices for production readiness.

## Status Legend
- queued
- ready
- blocked
- in_progress
- done
- superseded

## Active Program (Vertical Slices)

| Order | Slice | Priority | Status | Primary Gap(s) | Notes |
|---|---|---:|---:|---|---|
| 1 | VS-01 Runtime Data Plane Integration | P0 | in_progress | G-001 | Readiness planned; implementation pending |
| 2 | VS-02 Firmware Config Transport Adapter | P0 | queued | G-003 | Serial framing/parsing + dispatch bridge |
| 3 | VS-03 BLE Stack Callback Wiring Hardening | P0 | queued | G-002 | Real callback registration/dispatch hardening |
| 4 | VS-04 Startup Storage Lifecycle Hardening | P0 | queued | G-004 | Explicit NVS init and startup failure handling |
| 5 | VS-05 Test Bootstrap Portability | P1 | queued | G-005 | Remove hard external GTest prerequisite |
| 6 | VS-06 Web Runtime Consolidation | P1 | queued | G-006 | Canonical runtime path + drift control |
| 7 | VS-07 End-to-End Hardware Validation Pack | P0 | queued | G-001..G-006 verification | Hardware-backed evidence closure |
| 8 | VS-08 Release, Rollback, and Production Gate Closure | P0 | queued | Program closeout | Final go/no-go packet + approvals |

## Decision Backlog

| ID | Priority | Status | Task | Depends On | Notes |
|---|---|---:|---|---|---|
| T-005 | P0 | queued | Finalize unresolved BLE adapter scope decision | VS-03 | NimBLE vs Bluedroid vs both |
| T-013 | P0 | queued | Approve release artifact promotion policy | VS-08 | Staging -> candidate -> production |
| T-014 | P0 | queued | Approve production sign-off authority matrix | VS-08 | Final audit/go-live governance |

## Historical Program Status (Preserved)
- Legacy web slices `W-*`: superseded.
- Restart slices `WR-*`: completed history retained in `IMPLEMENTATION_SLICES.md`.
- Previous production-tracking slices (`PROD-*`, `FW-*`, `CFG-*`, `WEB-*`, `CI-*`, `QA-*`, `OPS-*`, `REL-*`) are preserved in `IMPLEMENTATION_SLICES.md` as historical execution records and do not represent the active queue.

## Backlog Rules
- One narrow slice at a time.
- Do not merge unrelated major concerns into one slice.
- Contract-first, validation-first, then implementation.
- Blocked items must remain explicitly labeled as blocked.
