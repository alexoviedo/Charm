# CURRENT_TASK.md

## Active Task
- ID: CT-010
- Title: S-008 — Device registry implementation
- Status: active

## Goal
Implement runtime device/interface registration, lookup, detach, and decode-plan association behavior for the device registry without introducing parser, mapping, profile, or adapter behavior.

## In Scope
- concrete in-memory device-registry implementation
- minimal concrete class declaration updates required to expose implementation
- core component CMake wiring for device-registry implementation source
- unit test coverage for register/lookup/detach/attach-decode-plan behavior

## Out Of Scope
- parser, decode-plan builder, decoder, mapping, profile, compiler, or supervisor implementations
- adapter implementations
- persistence behavior
- broad refactors outside registry implementation path

## Assumptions
- current device-registry request/result contracts in `device_registry.hpp` remain valid for implementation.
- interface registration currently provides interface-handle and interface-number metadata and can be tracked without adapter-native state.
- unresolved architecture decisions do not block runtime registry behavior for this slice.

## Dependencies
- merged S-004 PR
- merged S-007 PR
- `INTERFACES.md`
- `VALIDATION.md`
- `MEMORY.md`

## Touched Files
- `components/charm_core/include/charm/core/device_registry.hpp` — concrete in-memory registry class declaration
- `components/charm_core/src/device_registry.cpp` — registry implementation
- `components/charm_core/CMakeLists.txt` — compile source wiring
- `tests/unit/test_device_registry.cpp` — unit behavior checks
- `tests/unit/CMakeLists.txt` — unit test placeholder update for S-008
- `CURRENT_TASK.md` — active slice update and validation/rollback notes
- `TODO.md` — implementation queue bookkeeping for S-007/S-008
- `CHANGELOG_AI.md` — change log entry for S-008

## Risks
- registry behavior may require contract expansion later if interface-to-device linkage metadata is strengthened
- capacity limits and fault reason codes may require tuning in later memory-budget slices
- unit test remains standalone compile/run and not yet integrated into CI test orchestration

## Validation Plan
- V2 unit validation for register/lookup/detach/attach-decode-plan paths
- compile validation for updated `charm_core` component source wiring
- contract review spot-check against `INTERFACES.md` device-registry invariants

## Rollback Plan
- revert the S-008 PR to remove `device_registry.cpp`, header implementation declaration additions, unit test file, CMake wiring, and control-file bookkeeping
- no adapter/runtime integration rollback complexity expected

## Acceptance Gates
- runtime handles stay stable for active registration lifetime
- decode-plan association is supported for known interfaces
- lookup/detach error handling paths are covered by unit checks
- no persistence or adapter behavior is introduced
- scope remains limited to S-008 files

## Stop Condition
Stop after S-008 is implemented and submitted as a PR against `main`.
