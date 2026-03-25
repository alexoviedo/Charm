# TODO.md

## Purpose
Prioritized backlog of micro-tasks.
Each item must be small, reviewable, and separable.

## Status Legend
- queued
- ready
- blocked
- done

## Backlog

| ID | Priority | Status | Task | Depends On | Notes |
|---|---|---:|---|---|---|
| T-001 | P0 | ready | Review and approve initial repo control files | none | Current active slice is tracked in CURRENT_TASK.md |
| T-002 | P0 | queued | Normalize stable architecture into repo-approved ARCHITECTURE.md wording | T-001 | No behavior changes |
| T-003 | P0 | queued | Approve persistent project memory content and exclusions | T-001 | MEMORY.md only |
| T-004 | P0 | queued | Approve project execution policy and slice workflow | T-001 | DECISIONS.md + VALIDATION.md alignment |
| T-005 | P1 | queued | Finalize unresolved BLE adapter scope decision | T-001 | NimBLE vs Bluedroid vs both |
| T-006 | P1 | queued | Finalize initial output profile scope decision | T-001 | Select initial supported profile set |
| T-007 | P1 | queued | Decide config compiler placement | T-001 | On-device, web companion, or both |
| T-008 | P1 | queued | Define control-plane event catalog contract | T-001 | INTERFACES.md update only |
| T-009 | P1 | queued | Define USB host port contract details | T-001 | Interface-only slice |
| T-010 | P1 | queued | Define BLE transport port contract details | T-001 | Interface-only slice |
| T-011 | P1 | queued | Define config store contract and persistence metadata | T-001 | Interface-only slice |
| T-012 | P1 | queued | Define time port contract and timing assumptions | T-001 | Interface-only slice |
| T-013 | P1 | queued | Define canonical logical state surface and invariants | T-001 | Interface-only slice |
| T-014 | P1 | queued | Define stable HID identity schema and persistence invariants | T-001 | Interface-only slice |
| T-015 | P1 | queued | Define validation plan for first implementation slice | T-001 | VALIDATION.md first, code later |
| T-016 | P2 | queued | Select the first implementation slice after contracts are approved | T-005,T-006,T-008,T-009,T-010,T-011,T-012,T-013,T-014,T-015 | Must stay narrowly scoped |

## Backlog Rules
- No backlog item may combine unrelated concerns.
- If an item cannot be completed safely in one slice, split it.
- No implementation item moves to ready until contracts and validation are approved.
