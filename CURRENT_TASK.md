# CURRENT_TASK.md

## Active Task
- ID: CT-013
- Title: S-012 — Logical gamepad state container implementation
- Status: active

## Goal
Implement only the canonical logical-state container and reset/read semantics.

## In Scope
- Canonical logical-state container.
- Reset and read semantics for the logical gamepad state.

## Out Of Scope
- Mapping, profile, or adapter logic.
- Transport-dependent structures.

## Assumptions
- State remains transport-independent.
- Range/initialization rules are enforced at the contract level.

## Dependencies
- merged S-006 PR
- merged S-007 PR
- merged S-011 PR

## Touched Files
- `components/charm_core/src/logical_state.cpp`
- `components/charm_core/include/charm/core/logical_state.hpp`
- `components/charm_core/CMakeLists.txt`
- `tests/unit/test_logical_state.cpp`
- `tests/unit/CMakeLists.txt`
- `CURRENT_TASK.md`
- `TODO.md`
- `CHANGELOG_AI.md`

## Risks
- Implicit assumptions about data ranges or endianness from profiles.

## Validation Plan
- V2 unit tests for initialization, reset, snapshot, and range-contract behavior.

## Rollback Plan
- revert S-012 PR deleting `logical_state.cpp` and unit tests.

## Acceptance Gates
- State remains transport-independent.
- Range/initialization rules are enforced at the contract level.
- No mapping, profile, or adapter logic is introduced.

## Stop Condition
Stop after S-012 is implemented and submitted as a PR against `main`.
