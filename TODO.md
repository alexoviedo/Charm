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
| T-001 | P0 | done | Review and approve initial repo control files | none | Merged in PR #1 |
| T-002 | P0 | done | Normalize stable architecture into repo-approved ARCHITECTURE.md wording | T-001 | Completed by merged control scaffolding |
| T-003 | P0 | done | Approve persistent project memory content and exclusions | T-001 | Completed by merged control scaffolding |
| T-004 | P0 | done | Approve project execution policy and slice workflow | T-001 | Completed by merged control scaffolding |
| T-005 | P0 | queued | Finalize unresolved BLE adapter scope decision | T-004 | NimBLE vs Bluedroid vs both |
| T-006 | P0 | queued | Finalize initial output profile scope decision | T-004 | Select initial supported profile set |
| T-007 | P0 | queued | Decide config compiler placement | T-004 | On-device, companion web app, or both |
| T-008 | P0 | done | Define complete contract inventory grouped by module | T-004 | Captured in INTERFACES.md in this PR |
| T-009 | P0 | done | Define dependency map and forbidden dependency rules | T-008 | Captured in INTERFACES.md in this PR |
| T-010 | P0 | done | Define boundary-level error categories | T-008 | Captured in INTERFACES.md in this PR |
| T-011 | P0 | done | Define contract approval gate before implementation | T-008,T-009,T-010 | Captured in VALIDATION.md in this PR |
| T-012 | P1 | ready | Approve contract inventory, dependency map, and contract gate | T-005,T-006,T-007,T-008,T-009,T-010,T-011 | No implementation before this approval |
| T-013 | P1 | blocked | Select first implementation slice | T-012 | Must remain narrow and contract-scoped |
| T-014 | P1 | blocked | Define file-level touch list for first implementation slice | T-013 | No code before this is approved |
| T-015 | P1 | blocked | Define validation evidence for first implementation slice | T-013 | Validation-first before code |
| T-016 | P1 | blocked | Implement first approved slice | T-014,T-015 | No broad refactors |
| T-017 | P2 | queued | Finalize queue sizes and memory budget | T-012 | Needed before performance-sensitive implementation |
| T-018 | P2 | queued | Finalize persistence schema/version/integrity details | T-012 | Needed before config-store implementation |
| T-019 | P2 | queued | Finalize interface claim policy details | T-012 | Needed before USB-host adapter implementation |
| T-020 | P2 | queued | Finalize runtime task model | T-012 | Must preserve architecture boundaries |

## Backlog Rules
- No backlog item may combine unrelated concerns unless the Tech Lead explicitly asks for a combined documentation pass.
- If an item cannot be completed safely in one slice, split it.
- No implementation item moves to ready until contracts and validation are approved.
