# TODO.md

## Purpose
Prioritized backlog of micro-tasks.
Each item must be small, reviewable, and separable.

## Status Legend
- queued
- ready
- blocked
- done

## Decision Backlog

| ID | Priority | Status | Task | Depends On | Notes |
|---|---|---:|---|---|---|
| T-001 | P0 | done | Review and approve initial repo control files | none | Merged in PR #1 |
| T-002 | P0 | done | Normalize stable architecture into repo-approved ARCHITECTURE.md wording | T-001 | Completed by merged control scaffolding |
| T-003 | P0 | done | Approve persistent project memory content and exclusions | T-001 | Completed by merged control scaffolding |
| T-004 | P0 | done | Approve project execution policy and slice workflow | T-001 | Completed by merged control scaffolding |
| T-005 | P0 | queued | Finalize unresolved BLE adapter scope decision | T-004 | NimBLE vs Bluedroid vs both |
| T-006 | P0 | queued | Finalize initial output profile scope decision | T-004 | Select initial supported profile set |
| T-007 | P0 | queued | Decide config compiler placement | T-004 | On-device, companion web app, or both |
| T-008 | P0 | done | Define complete contract inventory grouped by module | T-004 | Captured in INTERFACES.md |
| T-009 | P0 | done | Define dependency map and forbidden dependency rules | T-008 | Captured in INTERFACES.md |
| T-010 | P0 | done | Define boundary-level error categories | T-008 | Captured in INTERFACES.md |
| T-011 | P0 | done | Define contract approval gate before implementation | T-008,T-009,T-010 | Captured in VALIDATION.md |
| T-012 | P0 | done | Approve contract inventory, dependency map, and contract gate | T-005,T-006,T-007,T-008,T-009,T-010,T-011 | Merged in PR #2 |
| T-013 | P0 | done | Plan implementation slices and select the first slice | T-012 | Captured in IMPLEMENTATION_SLICES.md |

## Implementation Slice Queue

| Order | Slice | Priority | Status | Depends On | Notes |
|---|---|---:|---:|---|---|
| 1 | S-001 | P0 | done | T-013 | Merged in PR #4 |
| 2 | S-002 | P0 | done | S-001 | Merged in PR #5 |
| 3 | S-003 | P0 | done | S-001,S-002 | Merged in PR #6 |
| 4 | S-004 | P0 | done | S-001,S-002,S-003 | Completed in S-004 PR |
| 5 | S-005 | P0 | done | S-001,S-002 | Completed in merged S-005 PR |
| 6 | S-006 | P0 | done | S-001,S-002,S-003 | Completed in merged S-006 PR |
| 7 | S-007 | P0 | done | S-003,S-004,S-005,S-006 | Completed in merged S-007 PR |
| 8 | S-008 | P1 | done | S-004,S-007 | Completed in merged S-008 PR |
| 9 | S-009 | P1 | done | S-005,S-007 | Completed in merged S-009 PR |
| 10 | S-010 | P1 | ready | S-009,S-007 | Active in CURRENT_TASK.md |
| 11 | S-011 | P1 | done | S-010,S-007 | HID report decoder implementation |
| 12 | S-012 | P1 | done | S-006,S-007 | Logical gamepad state container implementation |
| 13 | S-013 | P1 | done | S-006,S-007 | Completed in S-013 PR |
| 14 | S-014 | P1 | done | S-012,S-013,S-007 | Completed in S-014 PR |
| 15 | S-015 | P1 | done | S-012,U-002 | Profile catalog and first output encoder implementation |
| 16 | S-016 | P1 | done | S-004,S-013,S-014 | Supervisor state machine implementation |
| 17 | S-017 | P1 | done | S-003 | Platform time adapter implementation |
| 18 | S-018 | P1 | done | S-003,U-006 | Config-store adapter implementation |
| 19 | S-019 | P1 | done | S-003,U-007 | USB host adapter implementation |
| 20 | S-020 | P1 | done | S-003,U-001 | BLE transport adapter implementation |
| 21 | S-021 | P1 | done | S-015,S-016,S-017,S-019,S-020 | Thin app bootstrap and run-mode wiring |
| 22 | S-022 | P1 | done | S-013,S-016,S-018,U-003,U-006 | Config activation and persistence flow integration |
| 23 | S-023 | P1 | done | S-016,S-021 | Recovery and fault integration |
| 24 | S-024 | P2 | ready | S-021,S-023 | Manual hardware validation pass |
| 25 | P-001 | P0 | done | none | CI/CD repo audit and enforcement plan |
| 26 | P-002 | P0 | done | P-001 | Minimal compile-only GitHub CI |
| 27 | P-003 | P0 | ready | P-002 | Implement ESP-IDF firmware build GitHub Action workflow for ESP32-S3 |

## Backlog Rules
- No backlog item may combine unrelated concerns unless the Tech Lead explicitly asks for a combined documentation pass.
- If an item cannot be completed safely in one slice, split it.
- No implementation item moves to ready until contracts and validation are approved.
- The detailed per-slice plan lives in `IMPLEMENTATION_SLICES.md`.
