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
- app bootstrap or wiring
- tests unless absolutely required for the scaffold to compile
- runtime behavior changes

## Assumptions
- `IMPLEMENTATION_SLICES.md` is the approved slice plan.
- The first code slice should have the lowest rollback cost and no dependency on unresolved decisions.
- Minimal build/module scaffold is acceptable here because the repo currently has no approved code layout.

## Dependencies
- merged implementation-slice planning PR
- `INTERFACES.md`
- `VALIDATION.md`
- `MEMORY.md`
- no unresolved architecture decision blocks S-001

## Touched Files Likely
- `CMakeLists.txt`
- `main/CMakeLists.txt`
- `components/charm_contracts/CMakeLists.txt`
- `components/charm_contracts/include/charm/contracts/common_types.hpp`
- `components/charm_contracts/include/charm/contracts/identity_types.hpp`
- `components/charm_contracts/include/charm/contracts/status_types.hpp`
- `components/charm_contracts/include/charm/contracts/error_types.hpp`
- `CURRENT_TASK.md`
- `TODO.md`
- `CHANGELOG_AI.md`

## Risks
- the scaffold expands into thin app wiring or other non-contract concerns
- platform-native SDK types leak into shared contract headers
- the slice grows to include requests/events/ports before S-001 is reviewed
- extra files are touched without explicit justification

## Acceptance Gates
- only the files required for S-001 are touched
- shared contract headers compile
- no runtime behavior is introduced
- no request/event/port/core-module/adaptor logic is introduced
- validation is compile-only plus include-path sanity checks
- rollback remains low-cost

## Stop Condition
Stop after S-001 is implemented and submitted as a PR against `main`.
