# CURRENT_TASK.md

## Active Task
- ID: CT-008
- Title: S-006 — Logical state, mapping, profile, and config-compiler interface declarations
- Status: active

## Goal
Declare the remaining pure-core interface contracts for logical state, mapping, profile encoding, and config compilation without introducing runtime behavior.

## In Scope
- logical gamepad state declarations
- mapping bundle and mapping-engine interface declarations
- profile manager/report encoder interface declarations
- config compiler interface declarations
- minimal compile/include sanity wiring in `main`

## Out Of Scope
- implementations
- adapters
- parser/decode implementation behavior
- tests unless absolutely required for compile validation
- runtime behavior changes
- refactors outside the minimum include/dependency wiring for validation

## Assumptions
- S-001 through S-005 are merged on `main` and form the dependency base for this slice.
- Existing shared contracts (`ProfileId`, `MappingBundleRef`, `EncodedInputReport`, `InputElementEvent`) are sufficient for declaration-only S-006 boundaries.
- Unresolved decisions U-001, U-002, and U-003 remain explicit and do not block declaration-only S-006 interfaces.

## Dependencies
- merged S-001 PR
- merged S-002 PR
- merged S-003 PR
- `INTERFACES.md`
- `VALIDATION.md`
- `MEMORY.md`
- no unresolved architecture decision blocks declaration-only S-006

## Touched Files
- `components/charm_core/include/charm/core/logical_state.hpp` — logical-state contracts and access/reset declarations
- `components/charm_core/include/charm/core/mapping_bundle.hpp` — mapping-config and compiled mapping bundle declarations
- `components/charm_core/include/charm/core/mapping_engine.hpp` — mapping engine request/result and interface declarations
- `components/charm_core/include/charm/core/profile_manager.hpp` — profile selection, capability, and encoding interface declarations
- `components/charm_core/include/charm/core/config_compiler.hpp` — config validation/compile request-result and interface declarations
- `main/main.cpp` — include new core headers for compile/include sanity only
- `CURRENT_TASK.md` — active slice update and validation/rollback notes
- `TODO.md` — implementation queue bookkeeping for S-005/S-006
- `CHANGELOG_AI.md` — change log entry for S-006

## Risks
- declaration-only logical state shape may need bounded-capacity tuning after queue/memory decisions
- config compiler declarations must remain neutral to unresolved placement decision (on-device/web/both)
- profile capability declaration surface must avoid implying unresolved output-profile scope as an implementation commitment

## Validation Plan
- V1 review against `INTERFACES.md`
- compile-only validation for the updated `charm_core` declarations
- include-path sanity check through `main/main.cpp`
- transport-independence spot check to ensure logical state contracts remain profile- and transport-agnostic

## Rollback Plan
- revert the S-006 PR to remove only the new logical/mapping/profile/compiler declaration headers, include sanity wiring, and control-file bookkeeping
- no later slice should be based on the branch until S-006 is reviewed and merged

## Acceptance Gates
- only the files required for S-006 are touched
- all remaining pure-core declaration surfaces are present
- logical state contracts remain transport-independent
- profile and config-compiler declarations do not imply unresolved decisions as implementation facts
- validation remains contract review plus compile-only/include-path sanity checks
- rollback remains low-cost

## Stop Condition
Stop after S-006 is implemented and submitted as a PR against `main`.
