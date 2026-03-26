# CURRENT_TASK.md

## Active Task
- ID: CT-017
- Title: S-016 — Supervisor state machine implementation
- Status: done

## Goal
Implement only mode transitions, activation sequencing, and recovery state handling at the supervisor level.

## In Scope
- Create `DefaultSupervisor` in `supervisor.cpp`.
- Implement state transitions for supervisor mode, profile, and mapping bundles.
- Implement recovery state handling.
- Unit tests for supervisor logic.

## Out Of Scope
- USB parsing logic.
- Mapping logic.
- Decoding or transport encoding logic.

## Assumptions
- N/A

## Dependencies
- S-004
- S-007
- S-013
- S-014

## Touched Files
- `components/charm_core/src/supervisor.cpp`
- `components/charm_core/include/charm/core/supervisor.hpp`
- `components/charm_core/CMakeLists.txt`
- `tests/unit/test_supervisor.cpp`
- `tests/unit/CMakeLists.txt`
- `CURRENT_TASK.md`
- `TODO.md`
- `CHANGELOG_AI.md`

## Risks
- Incorrect state transitions could lead to invalid runtime states.

## Validation Plan
- V2 unit tests for mode transitions, invalid-state paths, and recovery transitions.

## Rollback Plan
- Revert S-016 PR.

## Acceptance Gates
- run/config modes remain mutually exclusive.
- supervisor coordinates state only and does not absorb parser, mapping, or encoding logic.
- recovery state entry/exit follows approved contract rules.

## Stop Condition
Stop after S-016 is implemented and submitted as a PR against `main`.
