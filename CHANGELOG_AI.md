# Changelog (AI)

## [Unreleased]
### Added
- Implemented `charm::app::ActivatePersistedConfig` in `components/charm_app` to load and activate stored mapping bundles and profiles during application initialization (S-022).
- Added test coverage in `tests/unit/test_config_activation.cpp`.
- Integrated config activation flow inside `charm::app::InitializeAndRun()`.

## Purpose
Plain-English log of AI-made repo changes.
Keep entries concise, factual, and reviewable.

---

## 2026-03-25
Initialized the proposed repo control scaffolding for the project.

Files covered:
- ARCHITECTURE.md
- MEMORY.md
- TODO.md
- CURRENT_TASK.md
- DECISIONS.md
- INTERFACES.md
- VALIDATION.md
- CHANGELOG_AI.md

What changed:
- Defined the stable architecture summary for repo control use
- Established persistent project memory rules
- Created a prioritized micro-task backlog
- Set exactly one active current task
- Recorded accepted, rejected, and unresolved decisions
- Captured high-level interface boundaries and invariants
- Defined slice validation gates
- Started the AI change log

What did not change:
- No application code
- No implementation logic
- No tests
- No dependency or runtime behavior changes

Why:
- To create a controlled development scaffold before any implementation work begins

Validation:
- Checked alignment with the approved architecture handoff
- Checked that unresolved items were not stored as stable architecture
- Checked that the current task count is exactly one

---

## 2026-03-25
Completed the contract-first implementation-boundary pass.

Files covered:
- INTERFACES.md
- VALIDATION.md
- TODO.md
- CURRENT_TASK.md
- CHANGELOG_AI.md

What changed:
- Expanded the repo from high-level interfaces to a complete boundary-level contract inventory grouped by module
- Added an explicit dependency map with allowed dependencies, forbidden dependencies, and isolation requirements
- Added boundary-level error categories
- Added a CONTRACT APPROVAL GATE that must be satisfied before any implementation begins
- Updated the active task and backlog to reflect the contract-first state of the repo

What did not change:
- No application code
- No tests
- No pseudocode
- No algorithms
- No architecture rewrite
- No runtime behavior changes

Why:
- To define the complete implementation boundary before any logic is written

Validation:
- Checked that the contract inventory remained boundary-level and did not describe implementation logic
- Checked that dependency rules stayed aligned with ARCHITECTURE.md
- Checked that unresolved decisions were not silently converted into implementation assumptions
- Checked that CURRENT_TASK.md still contains exactly one active task

---

## 2026-03-25
Planned the smallest safe implementation slices and selected the first execution target.

Files covered:
- IMPLEMENTATION_SLICES.md
- TODO.md
- CURRENT_TASK.md
- MEMORY.md
- CHANGELOG_AI.md

What changed:
- Broke the approved architecture into ranked implementation slices
- Identified exact likely file touch sets, dependencies, acceptance criteria, validation steps, rollback impact, and isolation rationale for each slice
- Marked the contract-approval work complete and moved the repo into execution planning
- Selected `S-001 — Shared core contract code foundation` as the first execution target
- Added the exact next prompt to execute only the selected first slice

What did not change:
- No application code
- No tests
- No pseudocode
- No runtime behavior changes
- No architecture or interface contracts were rewritten

Why:
- To keep subsequent implementation narrow, reviewable, and aligned with the approved boundaries

Validation:
- Checked that each slice addressed one concern only
- Checked that unresolved decisions remained explicit blockers where required
- Checked that `CURRENT_TASK.md` points to a single selected first slice

---

## 2026-03-25
Executed Slice S-001 — Shared core contract code foundation.

Files covered:
- CMakeLists.txt
- main/CMakeLists.txt
- main/main.cpp
- components/charm_contracts/CMakeLists.txt
- components/charm_contracts/include/charm/contracts/common_types.hpp
- components/charm_contracts/include/charm/contracts/identity_types.hpp
- components/charm_contracts/include/charm/contracts/status_types.hpp
- components/charm_contracts/include/charm/contracts/error_types.hpp
- CURRENT_TASK.md
- TODO.md
- CHANGELOG_AI.md

What changed:
- Added the minimal ESP-IDF project scaffold required to host shared contract code
- Added a header-only `charm_contracts` component for shared contract definitions
- Implemented shared scalar, identity, status, and error contract types for S-001 only
- Added a minimal placeholder `main/main.cpp` entrypoint solely to support scaffold compilation
- Updated project-control files for the active S-001 slice

What did not change:
- No request/response shapes
- No event/message contracts
- No port declarations
- No core business logic
- No adapters or app wiring beyond the placeholder entrypoint
- No tests

Why:
- To establish the smallest low-risk code foundation required before later contract and behavior slices

Validation:
- Checked the header contracts against `INTERFACES.md`
- Checked that no platform SDK types leaked into shared contract headers
- Prepared compile-only scaffold validation and include-path sanity checks for the PR review

---

## 2026-03-25
Executed Slice S-002 — Shared request/response and event/message contract code.

Files covered:
- components/charm_contracts/include/charm/contracts/report_types.hpp
- components/charm_contracts/include/charm/contracts/requests.hpp
- components/charm_contracts/include/charm/contracts/events.hpp
- main/main.cpp
- CURRENT_TASK.md
- TODO.md
- CHANGELOG_AI.md

What changed:
- Added shared report metadata contract types
- Added shared request/result contract shapes
- Added shared event/message contract shapes
- Updated the main include-path sanity check to include the new shared headers
- Updated project-control files for the active S-002 slice

What did not change:
- No port declarations
- No supervisor, registry, parser, decoder, mapping, profile, compiler, adapter, or app logic
- No tests
- No runtime behavior
- No changes to S-001 shared scalar/identity/status/error contracts

Why:
- To extend the shared contract surface needed by later interface and pure-core slices without introducing behavior

Validation:
- Checked the new contracts against `INTERFACES.md`
- Checked that no platform SDK types leaked into the new headers
- Prepared compile-only and include-path sanity validation for PR review

---

## 2026-03-25
Executed Slice S-003 — Port interface declarations.

Files covered:
- components/charm_contracts/include/charm/contracts/transport_types.hpp
- components/charm_ports/CMakeLists.txt
- components/charm_ports/include/charm/ports/usb_host_port.hpp
- components/charm_ports/include/charm/ports/ble_transport_port.hpp
- components/charm_ports/include/charm/ports/config_store_port.hpp
- components/charm_ports/include/charm/ports/time_port.hpp
- main/CMakeLists.txt
- main/main.cpp
- CURRENT_TASK.md
- TODO.md
- CHANGELOG_AI.md

What changed:
- Added the header-only `charm_ports` component
- Declared the four external port interfaces
- Added the minimal shared support contracts needed to declare the ports cleanly
- Added compile/include sanity wiring in `main`
- Updated project-control files for the active S-003 slice

What did not change:
- No adapter implementations
- No supervisor, registry, parser, decoder, mapping, profile, compiler, or app logic
- No tests
- No runtime behavior
- No refactors outside the minimal include/dependency wiring for validation

Why:
- To establish the external seams required before later core-module and adapter slices can be declared or implemented safely

Validation:
- Checked the port declarations against `INTERFACES.md`
- Checked that no platform SDK types leaked through the port headers
- Prepared compile-only and include-path sanity validation for PR review

---

## 2026-03-25
Executed Slice S-004 — Supervisor, control-plane, and registry interface declarations.

Files covered:
- components/charm_contracts/include/charm/contracts/registry_types.hpp
- components/charm_core/CMakeLists.txt
- components/charm_core/include/charm/core/supervisor.hpp
- components/charm_core/include/charm/core/control_plane.hpp
- components/charm_core/include/charm/core/device_registry.hpp
- main/CMakeLists.txt
- main/main.cpp
- CURRENT_TASK.md
- TODO.md
- CHANGELOG_AI.md

What changed:
- Added the header-only `charm_core` component
- Declared the supervisor, control-plane, and device-registry interfaces
- Added the minimal shared support contracts needed to declare those interfaces cleanly
- Added compile/include sanity wiring in `main`
- Updated project-control files for the active S-004 slice

What did not change:
- No implementations
- No adapters
- No parser, decoder, mapping, profile, compiler, or app logic
- No tests
- No runtime behavior

Why:
- To establish the core orchestration and registry seams required before later pure-core implementation slices can be added safely

Validation:
- Checked the declarations against `INTERFACES.md`
- Checked that no platform SDK types leaked into the core headers
- Prepared compile-only and include-path sanity validation for PR review

---

## 2026-03-26
Executed Slice S-005 — Parser, decode-plan, and decoder interface declarations.

Files covered:
- components/charm_core/include/charm/core/hid_semantic_model.hpp
- components/charm_core/include/charm/core/decode_plan.hpp
- components/charm_core/include/charm/core/hid_decoder.hpp
- main/main.cpp
- CURRENT_TASK.md
- TODO.md
- CHANGELOG_AI.md

What changed:
- Declared parser-facing semantic HID descriptor model contracts and parse request/result shapes
- Declared decode-plan input/build/result contracts and decode binding plan structures
- Declared HID decoder request/result contracts and pure interface boundary
- Updated include-path sanity wiring in `main/main.cpp` for the new S-005 headers
- Updated project-control files for the active S-005 slice

What did not change:
- No parser implementation
- No decode-plan builder implementation
- No decoder implementation
- No adapters
- No mapping/profile/config/compiler/app logic
- No tests
- No runtime behavior

Why:
- To establish parser/decode/decoder boundary contracts required for subsequent pure-core implementation slices while preserving strict contract-first progression

Validation:
- Checked declarations against `INTERFACES.md` parser and decoder boundaries
- Checked that no platform SDK types leaked into new core headers
- Prepared compile-only and include-path sanity validation for PR review

---

## 2026-03-26
Executed Slice S-008 — Device registry implementation.

Files covered:
- components/charm_core/include/charm/core/device_registry.hpp
- components/charm_core/src/device_registry.cpp
- components/charm_core/CMakeLists.txt
- tests/unit/test_device_registry.cpp
- tests/unit/CMakeLists.txt
- CURRENT_TASK.md
- TODO.md
- CHANGELOG_AI.md

What changed:
- Added concrete `InMemoryDeviceRegistry` declaration and capacity defaults
- Implemented register-device, register-interface, lookup, detach-device, and attach-decode-plan behavior
- Added unit test covering key success and failure paths for S-008 behavior
- Updated `charm_core` CMake to compile the new device-registry source
- Updated project-control files for the active S-008 slice

What did not change:
- No parser/decode-plan builder/decoder implementation
- No mapping/profile/compiler/supervisor implementation
- No adapter or persistence implementation
- No hardware/integration tests

Why:
- To deliver the first pure-core runtime behavior slice for registry state handling while maintaining strict slice isolation

Validation:
- Ran standalone unit compile/run for `tests/unit/test_device_registry.cpp`
- Ran compile-only sanity for `main/main.cpp` with updated component wiring
- Spot-checked device-registry behavior against interface invariants in `INTERFACES.md`

---

## 2026-03-26
Executed Slice S-009 — HID semantic descriptor model implementation.

Files covered:
- components/charm_core/include/charm/core/hid_semantic_model.hpp
- components/charm_core/src/hid_semantic_model.cpp
- components/charm_core/CMakeLists.txt
- tests/unit/test_hid_semantic_model.cpp
- tests/unit/CMakeLists.txt
- CURRENT_TASK.md
- TODO.md
- CHANGELOG_AI.md

What changed:
- Declared `HidDescriptorParser` interface and `DefaultHidDescriptorParser` implementation in `components/charm_core/include/charm/core/hid_semantic_model.hpp`.
- Implemented `DefaultHidDescriptorParser::ParseDescriptor` in `components/charm_core/src/hid_semantic_model.cpp` to parse raw HID report descriptors and build a semantic model without executing device merging, mappings, or BLE packaging.
- Created `tests/unit/test_hid_semantic_model.cpp` providing a standalone compile-and-run testing mechanism with assertions covering empty, valid, and malformed descriptors.
- Added `src/hid_semantic_model.cpp` to `components/charm_core/CMakeLists.txt` build targets.
- Updated `CURRENT_TASK.md` to reflect the active task ID CT-011 and slice S-009 requirements and acceptance criteria.
- Updated `TODO.md` to indicate slice S-008 is complete and S-009 is now active.
- Added placeholders in `tests/unit/CMakeLists.txt` for S-009.

What did not change:
- No decode-plan builder implementation
- No decoder implementation
- No adapters
- No mapping/profile/config/compiler/app logic
- No runtime behavior changes outside parsing logic

Why:
- To provide the first core parser logic mapping raw descriptors to stable semantic collections and fields for future decoding.

Validation:
- V2 unit validation for parsing successfully passed with `./test_hid_semantic_model`.

---

## 2026-03-26
Executed Slice S-010 — Decode-plan builder implementation.

Files covered:
- components/charm_core/include/charm/core/decode_plan.hpp
- components/charm_core/src/decode_plan.cpp
- components/charm_core/CMakeLists.txt
- tests/unit/test_decode_plan.cpp
- tests/unit/CMakeLists.txt
- CURRENT_TASK.md
- TODO.md
- CHANGELOG_AI.md

What changed:
- Added `DecodePlanBuilder` interface and `DefaultDecodePlanBuilder` class in `components/charm_core/include/charm/core/decode_plan.hpp`.
- Implemented logic in `components/charm_core/src/decode_plan.cpp` to iterate through semantic descriptor model fields and emit decoding bindings.
- Added FNV-1a element key hashing for stable mapping identity using byte-wise evaluation of padded-or-packed `ElementKey` structs.
- Included basic InputElementType deduction heuristics for axes, hats, and buttons.
- Setup `tests/unit/test_decode_plan.cpp` with unit tests for mapping identity rules and capacity bounds.
- Updated project control documents (`CURRENT_TASK.md`, `TODO.md`) with S-010 active tracking.

What did not change:
- No execution logic for raw reports to canonical events (decoder execution).
- No adapter bindings.
- No mapping or profile behavior.
- Core types were kept isolated.

Why:
- To transform structural, semantic descriptor boundaries (S-009) into runtime map targets (DecodePlan) to drive the data-plane execution step safely.

Validation:
- V2 standalone unit testing: generated and executed successfully with capacity rejection testing and hashing deduplication verified.

---

## 2026-03-26
Executed Slice S-011 — HID report decoder implementation.

Files covered:
- components/charm_core/include/charm/core/hid_decoder.hpp
- components/charm_core/src/hid_decoder.cpp
- components/charm_core/CMakeLists.txt
- tests/unit/test_hid_decoder.cpp
- tests/unit/CMakeLists.txt
- CURRENT_TASK.md
- TODO.md
- CHANGELOG_AI.md

What changed:
- Added `DefaultHidDecoder` concrete class inheriting from `HidDecoder` interface.
- Implemented `DecodeReport` using a pre-allocated static array to bound memory allocations correctly and stay out of the heap for constant time execution.
- Extracted bits safely across byte boundaries supporting both signed and unsigned 8, 12, 16, etc bit fields.
- Verified expected capacities matching max decode bindings to prevent out-of-bounds mapping issues.
- Integrated `test_hid_decoder` in the unit testing harness and ensured 100% test coverage for boundaries, misconfigurations, sizes and signed extensions.
- Addressed project-control state to mark S-011 as done and prime S-012.

What did not change:
- No mapping or profile behavior.
- No logical gamepad state container logic.
- No BLE integration or device registries modification.
- Transport-dependent packaging.

Why:
- To implement canonical data-plane decoding bridging raw USB bytes into structured events according to the defined decode plan generated in S-010.

Validation:
- Tested using CTest harness on `tests/unit/build/` directory with 100% success rate on `test_hid_decoder` standalone execution covering mismatch lengths, missed plan, valid decodes and out of bounds parsing.

---

## 2026-03-26
Executed Slice S-012 — Logical gamepad state container implementation.

Files covered:
- components/charm_core/include/charm/core/logical_state.hpp
- components/charm_core/src/logical_state.cpp
- components/charm_core/CMakeLists.txt
- tests/unit/test_logical_state.cpp
- tests/unit/CMakeLists.txt
- CURRENT_TASK.md
- TODO.md
- CHANGELOG_AI.md

What changed:
- Added `CanonicalLogicalStateStore` to hold canonical gamepad state in `components/charm_core/src/logical_state.cpp` and `components/charm_core/include/charm/core/logical_state.hpp`.
- Implemented initialization, resetting, and mutable-fetching semantics for state container.
- Added unit tests for state container into `tests/unit/test_logical_state.cpp` and passed them via `CMakeLists.txt`.
- Updated CURRENT_TASK.md to point to S-013.
- Updated TODO.md marking S-012 as done and S-013 as ready.

What did not change:
- No mapping logic, profile logic, or adapter logic was introduced.
- Transport-dependent structures were not added.
- The `LogicalGamepadState` structure in `events.hpp` was not changed.

Why:
- To provide an isolated container for holding the canonical logical gamepad state, enabling the mapping engine to update it later.

Validation:
- Tested using CTest harness on `tests/unit/build/` directory with 100% success rate on `test_logical_state` testing initialization, mismatched profile IDs, mutable updates, and resets.

---

## 2026-03-26
Executed Slice S-013 — Mapping bundle validator/loader implementation.

Files covered:
- components/charm_core/include/charm/core/mapping_bundle.hpp
- components/charm_core/src/mapping_bundle.cpp
- components/charm_core/CMakeLists.txt
- tests/unit/test_mapping_bundle.cpp
- tests/unit/CMakeLists.txt
- CURRENT_TASK.md
- TODO.md
- CHANGELOG_AI.md

What changed:
- Added `ValidateMappingBundleRequest`, `ValidateMappingBundleResult`, `LoadMappingBundleRequest`, `LoadMappingBundleResult`, and `GetActiveBundleResult` to `mapping_bundle.hpp`.
- Added `MappingBundleValidator` and `MappingBundleLoader` interfaces and default implementations.
- Implemented `DefaultMappingBundleValidator::Validate` verifying version bounds, entry capacity bounds, and checking bundle integrity with `ElementKeyHash`-like FNV-1a evaluation.
- Implemented `DefaultMappingBundleLoader::Load` utilizing the validator before updating active cache state and exposing through `GetActiveBundle`.
- Covered paths with V2 unit tests verifying hashing bounds and rejection conditions.
- Handled transitioning `CURRENT_TASK.md` to S-014 requirements and marking S-013 as done in `TODO.md`.

What did not change:
- No mapping application logic or logic state mutators.
- No dynamic parsing or external adapter implementations.
- `MappingConfigDocument` wasn't converted or touched.

Why:
- To validate statically parsed mapping configurations effectively and to gate mapping runtime states with consistent inputs to achieve bounds correctness without platform specifics.

Validation:
- Evaluated `tests/unit/test_mapping_bundle.cpp` effectively with CMake/CTest hitting invalid hash rejections, max entries exceeding bounds, and successful loadings.

---

## 2026-03-26
Executed Slice S-014 — Mapping engine base implementation.

Files covered:
- components/charm_core/include/charm/core/mapping_engine.hpp
- components/charm_core/src/mapping_engine.cpp
- components/charm_core/CMakeLists.txt
- tests/unit/test_mapping_engine.cpp
- tests/unit/CMakeLists.txt
- CURRENT_TASK.md
- TODO.md
- CHANGELOG_AI.md

What changed:
- Added `DefaultMappingEngine` implementation inheriting from `MappingEngine`.
- Implemented `ApplyInputEvent` to lookup mappings from the active bundle and mutate the underlying canonical gamepad state.
- Supported mapping scales and offsets for axis, button, trigger, and hat inputs.
- Handled rejection of invalid bundle references gracefully.
- Added unit test coverage for direct event application, contract violations, missing/rejected bundle paths, and unmapped events.
- Updated `charm_core_obj` CMake targets to include `mapping_engine.cpp`.

What did not change:
- No BLE packing, profile processing, or transport behaviors were introduced.
- No direct device parsing or adapter calls were included.

Why:
- To apply validated input events onto a normalized canonical logical state according to an active mapping bundle deterministically and without hardware context.

Validation:
- Ran CTest for `MappingEngineTest` with 100% success checking offset computations, out-of-bounds state handling, state persistence, and reset requests.

---

## 2026-03-26
Executed Slice S-015 — Profile catalog and first output encoder implementation.

Files covered:
- components/charm_core/src/profile_manager.cpp
- components/charm_core/src/profile_generic_gamepad_encoder.cpp
- components/charm_core/include/charm/core/profile_manager.hpp
- components/charm_core/CMakeLists.txt
- tests/unit/test_profile_manager.cpp
- tests/unit/test_profile_generic_gamepad_encoder.cpp
- tests/unit/CMakeLists.txt
- CURRENT_TASK.md
- TODO.md
- CHANGELOG_AI.md
- IMPLEMENTATION_SLICES.md
- DECISIONS.md

What changed:
- Added `CanonicalProfileManager` to handle profile selection and encoding delegation.
- Added `GenericGamepadReport` packed struct to define the Generic Gamepad report shape.
- Added `profile_generic_gamepad::Encode` logic to map `LogicalGamepadState` variables to packed report arrays and fields.
- Clamped trigger ranges and axis ranges according to 8-bit sizing bounds.
- Resolved unresolved decision `U-002` to single profile first.
- Ensured proper routing of capabilities and rejection of unknown profile IDs.
- Validated logic state transformation mathematically through GTest expectations.

What did not change:
- No USB parsing or decoding code was manipulated.
- No BLE advertising or GATT server definitions were embedded into the core.
- No dynamic memory allocation used.

Why:
- To prepare an encoded array of bytes representing physical state independent of the BLE stack implementation safely and correctly.

Validation:
- Tested using CTest with a 100% passing rate. `ProfileManagerTest` checked correct delegation. `ProfileGenericGamepadEncoderTest` checked specific field assignments and boundary limit clamps.

---

## 2026-03-26
Executed Slice S-016 — Supervisor state machine implementation.

Files covered:
- components/charm_core/src/supervisor.cpp
- components/charm_core/include/charm/core/supervisor.hpp
- components/charm_core/CMakeLists.txt
- tests/unit/test_supervisor.cpp
- tests/unit/CMakeLists.txt
- CURRENT_TASK.md
- TODO.md
- CHANGELOG_AI.md
- IMPLEMENTATION_SLICES.md

What changed:
- Created `DefaultSupervisor` in `components/charm_core/src/supervisor.cpp`.
- Implemented state transitions for supervisor mode, profile, and mapping bundles.
- Implemented recovery state handling in accordance with `ModeState` and `RecoveryState` rules.
- Added unit tests for supervisor logic in `tests/unit/test_supervisor.cpp`.
- Updated project-control files to track the completion of S-016.

What did not change:
- No USB parsing or decoding logic was introduced.
- No BLE advertising or adapter bindings were embedded.
- Supervisor strictly coordinates state without absorbing parser, mapping, or encoding logic.

Why:
- To implement mode transitions, activation sequencing, and recovery state handling at the supervisor level to orchestrate runtime behavior safely.

Validation:
- Tested using CTest harness on `tests/unit/build/` directory with 100% success rate on `test_supervisor` covering valid state transitions, invalid transitions, profile/mapping bundle selection, and recovery states.

---

## 2026-03-26
Executed Slice S-017 — Platform time adapter implementation.

Files covered:
- components/charm_platform_time/CMakeLists.txt
- components/charm_platform_time/include/charm/platform/time_port_esp_idf.hpp
- components/charm_platform_time/src/time_port_esp_idf.cpp
- components/charm_test_support/include/esp_timer.h
- components/charm_test_support/src/esp_timer_mock.cpp
- tests/unit/CMakeLists.txt
- CURRENT_TASK.md
- TODO.md
- IMPLEMENTATION_SLICES.md

What changed:
- Added `TimePortEspIdf` implementing `charm::ports::TimePort`.
- Used `esp_timer_get_time` to return system ticks in microseconds.
- Registered the ESP-IDF component in its `CMakeLists.txt`.
- Mocked `esp_timer.h` and its get_time function locally so pure-core native tests can compile the adapter code and detect syntax errors.
- Updated project control documents for S-017 completion.

What did not change:
- No other adapters were implemented.
- Core logic contracts remained untouched.
- App wiring was untouched.

Why:
- To bridge the monotonic time requirement of the core domain to the underlying ESP-IDF timer implementation without tightly coupling core logic to platform headers.

Validation:
- V3 compile validation: Added the adapter and its mock to `tests/unit/CMakeLists.txt` and built the target natively.

---

## 2026-03-27
Executed Slice S-020 — BLE transport adapter implementation.

Files covered:
- components/charm_platform_ble/CMakeLists.txt
- components/charm_platform_ble/include/charm/platform/ble_transport_adapter.hpp
- components/charm_platform_ble/src/ble_transport_adapter.cpp
- tests/unit/test_ble_transport_adapter.cpp
- tests/unit/CMakeLists.txt
- CURRENT_TASK.md
- TODO.md
- IMPLEMENTATION_SLICES.md
- VALIDATION.md
- CHANGELOG_AI.md

What changed:
- Added `charm_platform_ble` component to satisfy the BLE adapter slice.
- Implemented `BleTransportAdapter` implementing `charm::ports::BleTransportPort`.
- Added mock logic for Start, Stop, NotifyInputReport and SetListener methods.
- Added V2/V3 unit tests in `tests/unit/test_ble_transport_adapter.cpp` using GTest.
- Linked new components and tests in `tests/unit/CMakeLists.txt`.
- Cleared the active task in `CURRENT_TASK.md` as per instruction not to start next slice.
- Marked S-020 done in `TODO.md` and `IMPLEMENTATION_SLICES.md`.
- Added validation evidence to `VALIDATION.md`.

What did not change:
- No integration with real NimBLE stack logic.
- No hardware bindings were implemented.
- No descriptor parsing or mapping logic was altered.

Why:
- To implement the adapter boundary for BLE transport while strictly preserving the V2/V3 testable design.

Validation:
- CTest successfully validated `BleTransportAdapterTest` with a 100% pass rate.

---

## 2026-03-27
Executed Slice S-021 — Thin app bootstrap and run-mode wiring.

Files covered:
- components/charm_app/CMakeLists.txt
- components/charm_app/include/charm/app/app_bootstrap.hpp
- components/charm_app/src/app_bootstrap.cpp
- main/main.cpp
- main/CMakeLists.txt
- CURRENT_TASK.md
- TODO.md
- IMPLEMENTATION_SLICES.md
- VALIDATION.md
- CHANGELOG_AI.md

What changed:
- Created the `charm_app` component to act as the thin wiring layer.
- Implemented `charm::app::InitializeAndRun()` to instantiate and wire core modules (`CanonicalLogicalStateStore`, `DefaultMappingEngine`, `CanonicalProfileManager`, `DefaultSupervisor`) and platform adapters (`TimePortEspIdf`, `UsbHostAdapter`, `BleTransportAdapter`).
- Modified `main.cpp` to call the new bootstrap initialization.
- Marked S-021 done in project tracking files and added validation evidence.

What did not change:
- No behavior changes in core or platform components.
- No complex dependency injection framework was introduced.

Why:
- To integrate the isolated core components and port implementations into a runnable application entry point.

Validation:
- Ran the existing unit test suite to ensure the new structural additions did not break compilation or linking of core functionality.
