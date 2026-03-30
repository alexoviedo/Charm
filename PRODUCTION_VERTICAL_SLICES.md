# Production Vertical Slices Program

## Status
- State: active execution program
- Activated by: `VS-PROG-001`
- Current active slice: `VS-01 Runtime Data Plane Integration`

## Purpose
Drive production readiness using one narrow, deployable, testable slice at a time, with code as the source of truth.

## Gap Mapping
- G-001 -> VS-01
- G-003 -> VS-02
- G-002 -> VS-03
- G-004 -> VS-04
- G-005 -> VS-05
- G-006 -> VS-06
- VS-07/VS-08 close cross-gap validation and production-gate evidence.

## Vertical Slice Sequence

| Slice | Name | Primary Focus | Acceptance Focus |
|---|---|---|---|
| VS-01 | Runtime Data Plane Integration | Wire USB -> decode/map -> profile encode -> BLE notify | Deterministic end-to-end runtime behavior with negative-path handling |
| VS-02 | Firmware Config Transport Adapter | Add serial framing/parsing adapter to `ConfigTransportService` | Command/response transport works end-to-end with lossless status/fault mapping |
| VS-03 | BLE Stack Callback Wiring Hardening | Real callback registration/dispatch into BLE adapter | Bounded recovery + fail-closed behavior under callback/report failures |
| VS-04 | Startup Storage Lifecycle Hardening | Explicit startup storage init sequence | `nvs_flash_init` lifecycle and startup failure handling are deterministic |
| VS-05 | Test Bootstrap Portability | Remove manual external GTest dependency burden | Clean-environment host tests configure/build reliably |
| VS-06 | Web Runtime Consolidation | Eliminate `web/` vs `web-next/` drift risk | One canonical runtime path and aligned docs/QA references |
| VS-07 | End-to-End Hardware Validation Pack | Hardware-backed matrix evidence across critical flows | Repeatable evidence for flash/monitor/config/BLE/recovery scenarios |
| VS-08 | Release, Rollback, and Production Gate Closure | Final closeout packet and approvals | Gate checklist, rollback rehearsal, integrity/provenance, go/no-go record |

## Program Constraints
- Preserve ports/adapters boundaries and deterministic core behavior.
- Keep serial-first config transport and zero-backend web posture unless explicitly re-decided.
- Do not merge unrelated concerns into one slice.
- Record blockers explicitly when capability proof is missing.

## Historical Note
Previous restart/prod programs remain preserved as historical records in control files. This VS plan is the active program moving forward.
