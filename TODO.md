# TODO.md

## Purpose
Prioritized backlog of micro-tasks.
Each item must be small, reviewable, and separable.

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
| T-005 | P0 | queued | Finalize unresolved BLE adapter scope decision | T-004 | NimBLE vs Bluedroid vs both |
| T-006 | P0 | done | Finalize initial output profile scope decision | T-004 | Accepted as single profile first |
| T-007 | P0 | done | Decide config compiler placement | T-004 | Accepted as companion web app |
| T-008 | P0 | done | Define complete contract inventory grouped by module | T-004 | Captured in INTERFACES.md |
| T-009 | P0 | done | Define dependency map and forbidden dependency rules | T-008 | Captured in INTERFACES.md |
| T-010 | P0 | done | Define boundary-level error categories | T-008 | Captured in INTERFACES.md |
| T-011 | P0 | done | Define contract approval gate before implementation | T-008,T-009,T-010 | Captured in VALIDATION.md |

## Implementation Slice Queue

| Order | Slice | Priority | Status | Depends On | Notes |
|---|---|---:|---:|---|---|
| 1 | WR-001 | P0 | done | none | Webapp restart control reset |
| 2 | WR-002 | P0 | done | WR-001 | Artifact contract and source decision |
| 3 | WR-003 | P0 | done | WR-002 | Parallel replacement shell foundation (`web-next/`) |
| 4 | WR-004 | P1 | done | WR-003 | Capability detection and support gating |
| 5 | WR-005 | P1 | done | WR-004 | Artifact ingestion baseline (same-site + manual local import) |
| 6 | WR-006 | P1 | done | WR-005 | Serial ownership and permission model |
| 7 | WR-007 | P1 | done | WR-006 | Web flasher baseline |
| 8 | WR-008 | P1 | done | WR-007 | Serial monitor baseline (serial-owner aware) |
| 9 | WR-009 | P1 | done | WR-008 | Flash/console session lifecycle hardening |
| 10 | WR-010 | P1 | done | WR-009 | Configuration IA + local draft model (transport contract approved) |
| 11 | WR-011 | P1 | done | WR-010 | Config validation plus import/export on approved config transport contract |
| 12 | WR-012 | P1 | done | WR-011 | Device config transport assessment (serial + BLE paths unproven) |
| 13 | WR-013 | P1 | done | WR-012 | Validation dashboard and Gamepad API tester |
| 14 | WR-014 | P1 | done | WR-013 | Cutover and legacy web removal |
| 15 | WR-015 | P1 | blocked | WR-014 | Config transport proof plan (define evidence needed to unblock runtime write/persist) |

## Superseded Legacy Web Slices

| Legacy Slice | Prior Status | New Status | Reason |
|---|---:|---:|---|
| W-001 | done | superseded | Restart from clean baseline; no incremental repair of legacy runtime |
| W-002 | done | superseded | Product contract replaced by restart-track controls |
| W-003 | done | superseded | Delivery assumptions redefined by WR-002 artifact contract |
| W-004 | done | superseded | Legacy runtime behavior is disposable |
| W-005 | done | superseded | Legacy runtime behavior is disposable |
| W-006 | done | superseded | Legacy runtime behavior is disposable |
| W-007 | ready | superseded | Replaced by WR-series contract-first restart slices |
| W-010 | done | superseded | Handoff replaced by restart-track planning |

## Backlog Rules
- No backlog item may combine unrelated concerns unless the Tech Lead explicitly asks for a combined documentation pass.
- If an item cannot be completed safely in one slice, split it.
- No implementation item moves to ready until contracts and validation are approved.
- The detailed per-slice plan lives in `IMPLEMENTATION_SLICES.md`.
