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

## Decision Backlog

| ID | Priority | Status | Task | Depends On | Notes |
|---|---|---:|---|---|---|
| T-005 | P0 | queued | Finalize unresolved BLE adapter scope decision | FW-004 | NimBLE vs Bluedroid vs both |
| T-012 | P0 | done | Approve production blocker severity rubric | PROD-002 | Captured by production gate definitions |
| T-013 | P0 | queued | Approve release artifact promotion policy | CI-001 | Staging -> candidate -> production |
| T-014 | P0 | queued | Approve production sign-off authority matrix | PROD-AUDIT-001 | Final audit/go-live governance |

## Program Slice Queue

| Order | Slice | Priority | Status | Depends On | Notes |
|---|---|---:|---:|---|---|
| 1 | PROD-001 | P0 | done | none | Production program control reset |
| 2 | PROD-002 | P0 | done | PROD-001 | Production definition and release gates (`PG-INT`/`PG-EXT`/`PG-PROD`) |
| 3 | FW-001 | P0 | done | PROD-002 | Firmware BLE productionization baseline (lifecycle/failure model + acceptance matrix) |
| 4 | FW-002 | P0 | done | FW-001 | Real BLE lifecycle implementation (start/stop, advertising readiness, peer status, error surfacing) |
| 5 | FW-003 | P0 | done | FW-002 | Real BLE report-notify data path implementation |
| 6 | FW-004 | P0 | done | FW-003 | BLE report-path hardening/callback integration with bounded recovery |
| 7 | CFG-001 | P0 | done | PROD-002 | Host/device config transport contract freeze |
| 8 | CFG-002 | P0 | done | CFG-001,FW-004 | Firmware-side config transport implementation (serial-primary v1 commands) |
| 9 | WEB-001 | P1 | done | CFG-002 | Web integration for proven config transport (serial-first commands wired) |
| 10 | WEB-002 | P1 | done | WEB-001 | Production UX hardening for config/flash/monitor/tester |
| 11 | CI-001 | P0 | done | PROD-002 | Production web deployment pipeline |
| 12 | CI-002 | P0 | done | CI-001 | Release packaging, provenance, and integrity hardening |
| 13 | QA-001 | P0 | done | CI-002 | Automated browser smoke/regression framework |
| 14 | QA-002 | P0 | done | QA-001 | Manual hardware acceptance matrix + evidence capture framework |
| 15 | OPS-001 | P1 | done | QA-002,CI-002 | Production runbooks, rollback, and support docs |
| 16 | REL-001 | P0 | done | OPS-001,QA-002,CI-002 | Pre-production system audit + narrow blocker closeout |
| 17 | REL-002 | P0 | done | REL-001 | Final production-readiness audit + handoff |
| 18 | VAL-001 | P1 | queued | FW-004,CFG-002,CI-002 | Automated validation expansion |
| 19 | PROD-AUDIT-001 | P0 | blocked | closeout-packet,approvals | Final production go/no-go authorization |

## Historical Program Status
- Legacy web slices `W-*`: superseded.
- Restart slices `WR-*`: completed history retained in `IMPLEMENTATION_SLICES.md`.

## Backlog Rules
- One narrow slice at a time.
- Do not merge unrelated major concerns into one slice.
- Contract-first, validation-first, then implementation.
- Blocked items must remain explicitly labeled as blocked.
