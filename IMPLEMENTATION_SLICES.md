# IMPLEMENTATION_SLICES.md

## Purpose
Break approved architecture and product constraints into the smallest safe slices.

## Active Program
- Active execution model: **Vertical Slices (`VS-*`)**.
- Driver source: verified gaps in `IMPLEMENTATION_GAPS.md` (G-001..G-006).
- Current active slice: **VS-01 Runtime Data Plane Integration** (readiness planned; implementation pending).

## VS Program Queue (authoritative)

| Order | Slice | Status | Primary Gap(s) | Acceptance Focus |
|---|---|---|---|---|
| 1 | VS-01 Runtime Data Plane Integration | in_progress | G-001 | USB -> decode/map/encode -> BLE notify wired with deterministic behavior |
| 2 | VS-02 Firmware Config Transport Adapter | queued | G-003 | Serial framing/parsing and dispatch to `ConfigTransportService` |
| 3 | VS-03 BLE Stack Callback Wiring Hardening | queued | G-002 | Real stack callback registration/dispatch and bounded recovery |
| 4 | VS-04 Startup Storage Lifecycle Hardening | queued | G-004 | Explicit `nvs_flash_init` lifecycle and startup fault handling |
| 5 | VS-05 Test Bootstrap Portability | queued | G-005 | Clean-environment tests without manual GTest install |
| 6 | VS-06 Web Runtime Consolidation | queued | G-006 | Single canonical runtime path and drift control |
| 7 | VS-07 End-to-End Hardware Validation Pack | queued | G-001..G-006 verification | Hardware-backed evidence matrix closure |
| 8 | VS-08 Release, Rollback, and Production Gate Closure | queued | Program closeout | Go/no-go packet, rollback rehearsal, approvals |

## Historical Programs (preserved)

### WR Restart Program
- `WR-001` .. `WR-014`: completed.
- `WR-015`: superseded by later control/program decisions.

### Prior Production-Tracking Program (historical)
The following slices remain historical execution records and are preserved for traceability:
- `PROD-001`, `PROD-002`
- `FW-001` .. `FW-004`
- `CFG-001`, `CFG-002`
- `WEB-001`, `WEB-002`
- `CI-001`, `CI-002`
- `QA-001`, `QA-002`
- `OPS-001`
- `REL-001`, `REL-002`
- `PROD-AUDIT-001` (blocked historical endpoint)

These records are retained for audit history and do not replace the active VS queue.
