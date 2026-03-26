# CURRENT_TASK.md

## Active Task
- ID: CT-004
- Title: S-002 — Shared request/response and event/message contract code
- Status: active

## Goal
Extend the shared `charm_contracts` surface with request/result shapes, report metadata, and event/message contracts without introducing any runtime behavior.

## In Scope
- shared request/result shapes
- shared report metadata/types
- shared event/message contracts
- include-path sanity update in `main/main.cpp`

## Out Of Scope
- changes to S-001 scalar/identity/status/error contracts unless required to fix a compile issue
- port declarations
- supervisor, registry, parser, decoder, mapping, profile, compiler, adapter, or app logic
- tests unless absolutely required for compile validation
- runtime behavior changes

## Assumptions
- S-001 is merged on `main` and is the required dependency base.
- `ModeState` and `RecoveryState` may remain opaque enum declarations in this slice.
- `LogicalStateSnapshot` may hold a pointer reference to `LogicalGamepadState` so S-002 does not pull S-006 into scope.

## Dependencies
- merged S-001 PR
- `INTERFACES.md`
- `VALIDATION.md`
- `MEMORY.md`
- no unresolved architecture decision blocks S-002

## Touched Files
- `components/charm_contracts/include/charm/contracts/report_types.hpp` — shared report metadata types
- `components/charm_contracts/include/charm/contracts/requests.hpp` — shared request/result shapes
- `components/charm_contracts/include/charm/contracts/events.hpp` — shared event/message contracts
- `main/main.cpp` — include-path sanity check for the new headers only
- `CURRENT_TASK.md` — active slice update and actual validation/rollback notes
- `TODO.md` — implementation queue bookkeeping for S-001/S-002
- `CHANGELOG_AI.md` — change log entry for S-002

## Risks
- opaque/future-boundary types (`ModeState`, `RecoveryState`, `LogicalGamepadState`) could tempt later slices to backfill multiple concerns at once
- report/message contracts could accidentally begin encoding ownership semantics or platform-native buffer types
- the slice could expand into port declarations or core-module declarations if not kept narrow

## Validation Plan
- V1 contract review against `INTERFACES.md`
- compile-only validation for the `charm_contracts` component
- include-path sanity check via `main/main.cpp`
- verify no platform-native SDK types appear in the new contracts
- verify `RawHidReportRef` remains ownership-neutral and uses only plain scalar pointer/length fields

## Rollback Plan
- revert the S-002 PR to remove only the new contract headers, the main include-path update, and control-file bookkeeping
- no later slice should be based on the branch until S-002 is reviewed and merged

## Acceptance Gates
- only the files required for S-002 are touched
- shared request/result and event/message headers compile
- no runtime behavior is introduced
- no port/core-module/adapter logic is introduced
- validation remains contract review plus compile-only/include-path sanity checks
- rollback remains low-cost

## Stop Condition
Stop after S-002 is implemented and submitted as a PR against `main`.
