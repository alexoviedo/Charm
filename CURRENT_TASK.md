# CURRENT_TASK.md

## Active Task
- ID: CT-016
- Title: S-015 — Profile catalog and first output encoder implementation
- Status: active

## Goal
Implement only profile selection metadata and the first approved output encoder.

## In Scope
- Implement profile selection metadata.
- Implement first approved output encoder.

## Out Of Scope
- USB parsing logic.
- Mapping logic.
- Multiple output profiles (unless specified).

## Assumptions
- N/A

## Dependencies
- merged S-006 PR
- merged S-012 PR
- U-002 decision.

## Touched Files
- `components/charm_core/src/profile_manager.cpp`
- `components/charm_core/src/profile_generic_gamepad_encoder.cpp`
- `components/charm_core/include/charm/core/profile_manager.hpp`
- `components/charm_core/CMakeLists.txt`
- `tests/unit/test_profile_manager.cpp`
- `tests/unit/test_profile_generic_gamepad_encoder.cpp`
- `tests/unit/CMakeLists.txt`
- `CURRENT_TASK.md`
- `TODO.md`
- `CHANGELOG_AI.md`

## Risks
- Output profile encoding is wrong for the chosen output structure.

## Validation Plan
- V2 unit tests for profile selection and encoding behavior.

## Rollback Plan
- revert S-015 PR deleting encoding tests and components.

## Acceptance Gates
- One approved initial profile is encoded from canonical logical state.
- Profile selection remains explicit and versionable.
- No USB parsing or mapping logic is introduced.

## Stop Condition
Stop after S-015 is implemented and submitted as a PR against `main`.
