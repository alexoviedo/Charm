# CURRENT_TASK.md

## Active Task
- ID: CT-003
- Title: S-001 — Shared core contract code foundation
- Status: active

## Goal
Create the minimal code-bearing foundation required to start implementation without introducing any runtime behavior.

## In Scope
- minimal build/module scaffold required to host shared contract code
- shared scalar contract definitions
- shared identity contract definitions
- shared status and error contract definitions

## Out Of Scope
- request/response shapes
- event/message contracts
- port declarations
- supervisor, registry, parser, decoder, mapping, profile, compiler, or adapter logic
- app bootstrap or wiring beyond the minimal placeholder entrypoint required for the build scaffold
- tests unless absolutely required for the scaffold to compile
- runtime behavior changes

## Assumptions
- `IMPLEMENTATION_SLICES.md` is the approved slice plan.
- The first code slice should have the lowest rollback cost and no dependency on unresolved decisions.
- A minimal `main/main.cpp` placeholder is required for the build scaffold and does not count as product behavior.

## Dependencies
- merged implementation-slice planning PR
- `INTERFACES.md`
- `VALIDATION.md`
- `MEMORY.md`
- no unresolved architecture decision blocks S-001

## Touched Files
- `CMakeLists.txt` — root ESP-IDF project scaffold
- `main/CMakeLists.txt` — minimal main component registration
- `main/main.cpp` — minimal placeholder entrypoint for scaffold validation only
- `components/charm_contracts/CMakeLists.txt` — shared-contract component registration
- `components/charm_contracts/include/charm/contracts/common_types.hpp` — shared scalar contract types
- `components/charm_contracts/include/charm/contracts/identity_types.hpp` — stable identity and handle contract types
- `components/charm_contracts/include/charm/contracts/status_types.hpp` — minimal shared status contract types
- `components/charm_contracts/include/charm/contracts/error_types.hpp` — shared error categories and `FaultCode`
- `CURRENT_TASK.md` — actual slice state and validation notes
- `TODO.md` — slice queue notes for S-001
- `CHANGELOG_AI.md` — change log entry for S-001

## Risks
- the scaffold expands into non-contract concerns
- platform-native SDK types leak into shared contract headers
- the slice grows to include requests/events/ports before S-001 is reviewed
- extra files are touched without explicit justification

## Validation Plan
- V1 contract review against `INTERFACES.md`
- compile-only validation for the scaffold and `charm_contracts` component
- include-path sanity check from the minimal main component
- verify no platform SDK types leak into the shared contract headers

## Rollback Plan
- revert the S-001 PR to remove only scaffold files, shared declarations, and control-file bookkeeping
- no later slice should be based on the branch until S-001 is reviewed and merged

## Acceptance Gates
- only the files required for S-001 are touched
- shared contract headers compile
- no runtime behavior is introduced
- no request/event/port/core-module/adapter logic is introduced
- validation remains compile-only plus include-path sanity checks
- rollback remains low-cost

## Stop Condition
Stop after S-001 is implemented and submitted as a PR against `main`.
