# CURRENT_TASK.md

## Active Task
- ID: CT-015
- Title: S-014 — Mapping engine base implementation
- Status: active

## Goal
Implement only canonical event application into canonical logical state using an approved active mapping bundle.

## In Scope
- Implement canonical event application into canonical logical state using an approved active mapping bundle.

## Out Of Scope
- Event-application or profile logic.
- Mapping compilation implementation details.
- BLE packing, parser internals, or adapter calls.

## Assumptions
- The metadata format aligns with the `CompiledMappingBundle` structure.

## Dependencies
- merged S-006 PR
- merged S-012 PR
- merged S-013 PR
- merged S-007 PR

## Touched Files
- `components/charm_core/src/mapping_engine.cpp`
- `components/charm_core/include/charm/core/mapping_engine.hpp`
- `components/charm_core/CMakeLists.txt`
- `tests/unit/test_mapping_engine.cpp`
- `tests/unit/CMakeLists.txt`
- `CURRENT_TASK.md`
- `TODO.md`
- `CHANGELOG_AI.md`

## Risks
- Canonical event application may be incorrect.

## Validation Plan
- V2 unit tests for direct event application, contract violations, and missing/rejected bundle paths.

## Rollback Plan
- revert S-014 PR deleting mapping engine logic and tests.

## Acceptance Gates
- Mapping output is canonical logical state only.
- No BLE packing, parser internals, or adapter calls appear in the implementation.
- Engine behavior remains unit-testable without hardware.

## Stop Condition
Stop after S-014 is implemented and submitted as a PR against `main`.
