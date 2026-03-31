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
| 1 | VS-01 Runtime Data Plane Integration | P0 | done | G-001 | Runtime wiring implemented; local host-test evidence passed |
| 2 | VS-02 Firmware Config Transport Adapter | P0 | done | G-003 | Serial runtime adapter implemented; host evidence passed |
| 3 | VS-03 BLE Stack Callback Wiring Hardening | P0 | done | G-002 | Real callback dispatch + bounded recovery wired; host evidence passed |
| 4 | VS-04 Startup Storage Lifecycle Hardening | P0 | done | G-004 | Explicit startup storage init + fail-closed gating implemented; host evidence passed |
| 5 | VS-05 Test Bootstrap Portability | P1 | done | G-005 | GTest bootstrap fallback added; clean-env host evidence passed |
| 6 | VS-06 Web Runtime Consolidation | P1 | done | G-006 | Canonical runtime path fixed to `web/`; `web-next/` removed |
| 7 | VS-07 End-to-End Hardware Validation Pack | P0 | done | G-001..G-006 verification | Validation pack defined with explicit captured/pending evidence ledger |
| 8 | VS-08 Release, Rollback, and Production Gate Closure | P0 | done | Program closeout | Closure package complete; posture is blocked/do-not-ship pending closeout inputs |
| 9 | AUTH-HOLD-001 Final Post-Program Audit / Authorization Hold | P0 | in_progress | VS-08 closeout follow-through | Final audit published; hold retained pending C-01..C-04 closeout |

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
