# CURRENT_TASK.md

## Active Task
- ID: CT-006
- Title: S-004 — Supervisor, control-plane, and registry interface declarations
- Status: active

## Goal
Declare the supervisor, control-plane, and device-registry interfaces and the minimal support contracts they require, without introducing any runtime behavior.

## In Scope
- supervisor interface declarations
- control-plane interface declarations
- device-registry interface declarations
- minimal shared support contracts required to declare those interfaces cleanly
- compile/include sanity wiring in `main`

## Out Of Scope
- implementations
- adapters
- parser, decoder, mapping, profile, compiler, or app logic
- tests unless absolutely required for compile validation
- runtime behavior changes
- refactors outside the minimum include/dependency wiring for validation

## Assumptions
- S-001, S-002, and S-003 are merged on `main` and form the dependency base for this slice.
- `ActiveProfileRef`, `ActiveMappingBundleRef`, `FaultRecordRef`, `DecodePlanRef`, and `RegistryEntry` are required support contracts for clean S-004 declarations and can be introduced in one small shared support header.
- `ModeState` and `RecoveryState` can be defined concretely in this slice because they are supervisor-owned state contracts already referenced opaquely from S-002.

## Dependencies
- merged S-001 PR
- merged S-002 PR
- merged S-003 PR
- `INTERFACES.md`
- `VALIDATION.md`
- `MEMORY.md`
- no unresolved architecture decision blocks S-004

## Touched Files
- `components/charm_contracts/include/charm/contracts/registry_types.hpp` — minimal shared support contracts for S-004
- `components/charm_core/CMakeLists.txt` — header-only `charm_core` component registration
- `components/charm_core/include/charm/core/supervisor.hpp` — supervisor declarations and boundary types
- `components/charm_core/include/charm/core/control_plane.hpp` — control-plane declarations
- `components/charm_core/include/charm/core/device_registry.hpp` — registry declarations and request/result shapes
- `main/CMakeLists.txt` — add `charm_core` dependency for compile/include sanity only
- `main/main.cpp` — include new core headers for sanity only
- `CURRENT_TASK.md` — active slice update and actual validation/rollback notes
- `TODO.md` — implementation queue bookkeeping for S-003/S-004
- `CHANGELOG_AI.md` — change log entry for S-004

## Risks
- support contracts added for S-004 could tempt later slices to mix interface declaration work with implementation work
- `ModeState` and `RecoveryState` are now concrete and must remain supervisor-owned rather than becoming cross-module dumping grounds
- registry declarations could accidentally start depending on adapter details if later edits are not disciplined

## Validation Plan
- V1 review against `INTERFACES.md`
- compile-only validation for the new `charm_core` component
- include-path sanity check through `main/main.cpp`
- dependency-boundary spot check to ensure no platform SDK types leak into the core headers and no adapter details appear in them

## Rollback Plan
- revert the S-004 PR to remove only the header-only `charm_core` component, the minimal shared support header, the `main` include wiring, and control-file bookkeeping
- no later slice should be based on the branch until S-004 is reviewed and merged

## Acceptance Gates
- only the files required for S-004 are touched
- declarations match approved module boundaries
- supervisor contracts do not absorb parsing, mapping, encoding, or adapter internals
- registry contracts do not imply persistence or parser-local identity
- validation remains contract review plus compile-only/include-path sanity checks
- rollback remains low-cost

## Stop Condition
Stop after S-004 is implemented and submitted as a PR against `main`.
