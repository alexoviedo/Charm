# CURRENT_TASK.md

## Active Task
- ID: CT-011
- Title: S-009 — HID semantic descriptor model implementation
- Status: active

## Goal
Implement only semantic descriptor parsing and model construction needed to represent HID semantics and stable identity inputs, without implementing mapping, profile, or decoding logic.

## In Scope
- semantic HID descriptor parsing logic
- core component CMake wiring for hid semantic model implementation source
- unit test coverage for semantic parsing

## Out Of Scope
- decode-plan building, decoder, mapping, profile, compiler, or supervisor implementations
- adapter implementations
- persistence behavior
- broad refactors outside semantic model implementation path

## Assumptions
- current semantic model request/result contracts in `hid_semantic_model.hpp` remain valid for implementation.
- unresolved architecture decisions do not block parsing behavior for this slice.

## Dependencies
- merged S-005 PR
- merged S-007 PR
- `INTERFACES.md`
- `VALIDATION.md`
- `MEMORY.md`

## Touched Files
- `components/charm_core/include/charm/core/hid_semantic_model.hpp` — add parser class declaration
- `components/charm_core/src/hid_semantic_model.cpp` — parser implementation
- `components/charm_core/CMakeLists.txt` — compile source wiring
- `tests/unit/test_hid_semantic_model.cpp` — unit behavior checks
- `tests/unit/CMakeLists.txt` — unit test placeholder update for S-009
- `CURRENT_TASK.md` — active slice update and validation/rollback notes
- `TODO.md` — implementation queue bookkeeping for S-009
- `CHANGELOG_AI.md` — change log entry for S-009

## Risks
- parsing may require handling specific quirk reports in the future
- long item support is deferred, which may be needed for very complex descriptors
- unit test remains standalone compile/run

## Validation Plan
- V2 unit validation for valid and malformed descriptor parse paths
- compile validation for updated `charm_core` component source wiring

## Rollback Plan
- revert the S-009 PR to remove `hid_semantic_model.cpp`, header implementation declaration additions, unit test file, CMake wiring, and control-file bookkeeping
- no adapter/runtime integration rollback complexity expected

## Acceptance Gates
- parser logic maps global and local items properly into `SemanticDescriptorModel`
- malformed descriptors are rejected
- no persistence or adapter behavior is introduced
- scope remains limited to S-009 files

## Stop Condition
Stop after S-009 is implemented and submitted as a PR against `main`.
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
