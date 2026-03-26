# CURRENT_TASK.md

## Active Task
- ID: CT-014
- Title: S-013 — Mapping bundle validator/loader implementation
- Status: active

## Goal
Implement only loading and validating compiled mapping-bundle metadata needed by the mapping engine.

## In Scope
- Load and validate mapping bundle metadata.
- Provide `MappingBundleRef` handling and version/integrity validation.

## Out Of Scope
- Event-application or profile logic.
- Mapping compilation implementation details.

## Assumptions
- The metadata format aligns with the `CompiledMappingBundle` structure.

## Dependencies
- merged S-006 PR
- merged S-007 PR
- merged S-012 PR

## Touched Files
- `components/charm_core/src/mapping_bundle.cpp`
- `components/charm_core/include/charm/core/mapping_bundle.hpp`
- `components/charm_core/CMakeLists.txt`
- `tests/unit/test_mapping_bundle.cpp`
- `tests/unit/CMakeLists.txt`
- `CURRENT_TASK.md`
- `TODO.md`
- `CHANGELOG_AI.md`

## Risks
- Incorrect integrity or version checks leading to broken states.

## Validation Plan
- V2 unit tests for version/integrity acceptance and rejection paths.

## Rollback Plan
- revert S-013 PR deleting mapping bundle logic and tests.

## Acceptance Gates
- Mapping-bundle metadata can be loaded/validated without storage or compiler placement assumptions.
- No event-application or profile logic is introduced.

## Stop Condition
Stop after S-013 is implemented and submitted as a PR against `main`.
