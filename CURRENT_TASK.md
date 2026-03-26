# CURRENT_TASK.md

## Active Task
- ID: CT-012
- Title: S-010 — Decode-plan builder implementation
- Status: active

## Goal
Implement deterministic conversion from semantic descriptor model to decode-plan structures, hashing `ElementKey` into `ElementKeyHash` and defining `InputElementType`.

## In Scope
- Decode-plan builder logic mapping parsed fields to decoding metadata bindings.
- FNV-1a hashing logic for `ElementKey`.
- Type heuristics for assigning inputs as buttons, axes, or hats.
- CMake wiring and unit testing.

## Out Of Scope
- decoder execution logic.
- semantic parser implementation (already in S-009).
- adapters, mapping, and profiles.

## Assumptions
- Current interface `decode_plan.hpp` and structs are stable.
- FNV-1a matches the memory constraint requirements.

## Dependencies
- merged S-009 PR
- merged S-005 PR
- merged S-007 PR

## Touched Files
- `components/charm_core/include/charm/core/decode_plan.hpp`
- `components/charm_core/src/decode_plan.cpp`
- `components/charm_core/CMakeLists.txt`
- `tests/unit/test_decode_plan.cpp`
- `tests/unit/CMakeLists.txt`
- `CURRENT_TASK.md`
- `TODO.md`
- `CHANGELOG_AI.md`

## Risks
- Hashing padded structs is problematic unless `__attribute__((packed))` is respected on `ElementKey`, per memory requirements.
- Heuristics for `InputElementType` might need to be refined for weird usage pages (e.g. simulation).

## Validation Plan
- V2 unit tests verifying deterministic plan generation and capacity boundaries.

## Rollback Plan
- revert S-010 PR deleting `decode_plan.cpp` and unit tests.

## Acceptance Gates
- FNV-1a hashing generates identical hashes for identical data.
- Decode plans generate correct decoding metadata limits per input field.
- Type deduction maps Generic Desktop X/Y to Axis, Generic Desktop Hat Switch to Hat, Button Page to Button.

## Stop Condition
Stop after S-010 is implemented and submitted as a PR against `main`.
- ID: CT-007
- Title: S-005 — Parser, decode-plan, and decoder interface declarations
- Status: active

## Goal
Declare the semantic HID model, decode-plan surface, and runtime decoder interface contracts without introducing descriptor parsing or report decoding behavior.

## In Scope
- parser-facing semantic descriptor model declarations
- decode-plan contract declarations
- HID decoder interface declarations
- minimal compile/include sanity wiring in `main`

## Out Of Scope
- implementations
- adapters
- mapping, logical-state, profile, config-compiler, or app logic
- tests unless absolutely required for compile validation
- runtime behavior changes
- refactors outside the minimum include/dependency wiring for validation

## Assumptions
- S-001, S-002, S-003, and S-004 are merged on `main` and form the dependency base for this slice.
- Existing shared contracts (`RawDescriptorRef`, `RawHidReportRef`, `InputElementEvent`, `ElementKey`, `ElementKeyHash`) are sufficient for declaration-only parser/decoder boundaries.
- Unresolved decisions U-001..U-008 remain explicit and do not block declaration-only S-005 scope.

## Dependencies
- merged S-001 PR
- merged S-002 PR
- `INTERFACES.md`
- `VALIDATION.md`
- `MEMORY.md`
- no unresolved architecture decision blocks declaration-only S-005

## Touched Files
- `components/charm_core/include/charm/core/hid_semantic_model.hpp` — parser-facing semantic descriptor model and parse request/result declarations
- `components/charm_core/include/charm/core/decode_plan.hpp` — decode-plan input/plan/build request-result declarations
- `components/charm_core/include/charm/core/hid_decoder.hpp` — decoder request/result and interface declaration
- `main/main.cpp` — include new core headers for compile/include sanity only
- `CURRENT_TASK.md` — active slice update and validation/rollback notes
- `TODO.md` — implementation queue bookkeeping for S-004/S-005
- `CHANGELOG_AI.md` — change log entry for S-005

## Risks
- semantic/decode contracts could accidentally become persistence-coupled if later edits introduce parser-local identity assumptions
- decode-plan declarations may become over-specified before runtime limits are finalized
- declaration-only result payloads use pointer-based event views and require explicit ownership rules at implementation time

## Validation Plan
- V1 review against `INTERFACES.md`
- compile-only validation for the updated `charm_core` declarations
- include-path sanity check through `main/main.cpp`
- identity-rule spot check to ensure parser-local numbering is not introduced as persistence identity

## Rollback Plan
- revert the S-005 PR to remove only the new parser/decode/decoder declaration headers, include sanity wiring, and control-file bookkeeping
- no later slice should be based on the branch until S-005 is reviewed and merged

## Acceptance Gates
- only the files required for S-005 are touched
- parser and decoder declarations remain separated from transport and persistence behavior
- stable semantic identity expectations are represented without parser-local persistence coupling
- validation remains contract review plus compile-only/include-path sanity checks
- rollback remains low-cost

## Stop Condition
Stop after S-005 is implemented and submitted as a PR against `main`.
