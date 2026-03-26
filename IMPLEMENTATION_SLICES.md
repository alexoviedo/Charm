# IMPLEMENTATION_SLICES.md

## Purpose
Break the approved architecture into the smallest safe implementation slices before any logic is written.

## Planning Assumptions
- The repo currently contains approved control documents but no approved code layout.
- The file paths below are a planning assumption only; changing them later requires explicit approval.
- Assumed code organization:
  - `CMakeLists.txt`
  - `main/CMakeLists.txt`
  - `main/main.cpp`
  - `components/charm_contracts/...`
  - `components/charm_ports/...`
  - `components/charm_core/...`
  - `components/charm_test_support/...`
  - `components/charm_platform_time/...`
  - `components/charm_platform_storage/...`
  - `components/charm_platform_usb/...`
  - `components/charm_platform_ble/...`
  - `components/charm_app/...`
  - `tests/unit/...`

## Slice Catalog

### S-001 — Shared core contract code foundation
- Objective:
  - Create the minimal build/module scaffold required to host shared contract code, and implement only the shared scalar, identity, status, and error contract definitions.
- Exact files likely to be created or modified:
  - `CMakeLists.txt`
  - `main/CMakeLists.txt`
  - `components/charm_contracts/CMakeLists.txt`
  - `components/charm_contracts/include/charm/contracts/common_types.hpp`
  - `components/charm_contracts/include/charm/contracts/identity_types.hpp`
  - `components/charm_contracts/include/charm/contracts/status_types.hpp`
  - `components/charm_contracts/include/charm/contracts/error_types.hpp`
- Contracts involved:
  - `ElementKey`
  - `ElementKeyHash`
  - `DeviceHandle`
  - `InterfaceHandle`
  - `Timestamp`
  - `Duration`
  - `FaultCode`
  - `ProfileId`
  - `MappingBundleRef`
  - shared status and error categories
- Dependencies:
  - merged contract inventory in `INTERFACES.md`
  - no unresolved decisions block this slice
- Acceptance criteria:
  - the repo has a minimal approved code/module scaffold
  - shared contract headers exist and compile
  - no runtime behavior, adapters, parsing, mapping, or transport logic is introduced
  - no platform SDK types leak into shared contracts
- Validation steps:
  - V1 contract review against `INTERFACES.md`
  - compile-only validation for the new contract component
  - include-path sanity check from one consumer header
- Rollback impact if it fails:
  - low; rollback removes only scaffolding and shared declarations
- Why this slice is safely isolated:
  - it establishes foundational types only and has no runtime behavior
- Test-first:
  - no

### S-002 — Shared request/response and event/message contract code
- Objective:
  - Implement the shared request/response shapes and shared event/message contracts without introducing any behavior.
- Exact files likely to be created or modified:
  - `components/charm_contracts/include/charm/contracts/requests.hpp`
  - `components/charm_contracts/include/charm/contracts/events.hpp`
  - `components/charm_contracts/include/charm/contracts/report_types.hpp`
  - `components/charm_contracts/CMakeLists.txt`
- Contracts involved:
  - shared request/result shapes
  - `ControlPlaneEvent`
  - `RawHidReportRef`
  - `InputElementEvent`
  - `LogicalStateSnapshot`
  - `FaultEvent`
  - `AdapterStatusEvent`
  - `ReportMeta`
- Dependencies:
  - S-001
- Acceptance criteria:
  - all shared request/response and event/message contracts are declared
  - ownership/lifetime notes for report references are reflected in the declarations
  - no platform-native types appear in the contracts
- Validation steps:
  - V1 contract review against `INTERFACES.md`
  - compile-only validation
  - header-level include sanity checks
- Rollback impact if it fails:
  - low; rollback removes shared contract declarations only
- Why this slice is safely isolated:
  - it extends the contract surface without introducing runtime behavior
- Test-first:
  - no

### S-003 — Port interface declarations
- Objective:
  - Declare the four external port interfaces and nothing else.
- Exact files likely to be created or modified:
  - `components/charm_ports/CMakeLists.txt`
  - `components/charm_ports/include/charm/ports/usb_host_port.hpp`
  - `components/charm_ports/include/charm/ports/ble_transport_port.hpp`
  - `components/charm_ports/include/charm/ports/config_store_port.hpp`
  - `components/charm_ports/include/charm/ports/time_port.hpp`
- Contracts involved:
  - USB host port
  - BLE transport port
  - config store port
  - time port
  - start/stop request/result shapes
- Dependencies:
  - S-001
  - S-002
- Acceptance criteria:
  - all port interfaces are declared with approved boundary methods only
  - no adapter implementation details appear in port headers
  - no direct ESP-IDF, BLE stack, or storage SDK types leak through the ports
- Validation steps:
  - V1 review against `INTERFACES.md`
  - compile-only validation
  - forbidden-dependency spot check
- Rollback impact if it fails:
  - low; rollback removes port declarations only
- Why this slice is safely isolated:
  - it defines external seams only and does not implement adapters
- Test-first:
  - no

### S-004 — Supervisor, control-plane, and registry interface declarations
- Objective:
  - Declare the core contracts for supervisor coordination, control-plane handling, and runtime device/interface registry responsibilities.
- Exact files likely to be created or modified:
  - `components/charm_core/CMakeLists.txt`
  - `components/charm_core/include/charm/core/supervisor.hpp`
  - `components/charm_core/include/charm/core/control_plane.hpp`
  - `components/charm_core/include/charm/core/device_registry.hpp`
- Contracts involved:
  - `SupervisorState`
  - `ModeState`
  - `RecoveryState`
  - `FaultRecordRef`
  - registry request/result shapes
  - control-plane event consumption/publication contracts
- Dependencies:
  - S-001
  - S-002
  - S-003
- Acceptance criteria:
  - declarations match approved module boundaries
  - supervisor contracts do not absorb parsing, mapping, encoding, or adapter internals
  - registry contracts do not imply persistence or parser-local identity
- Validation steps:
  - V1 review against `INTERFACES.md`
  - compile-only validation
  - dependency-boundary spot check
- Rollback impact if it fails:
  - low
- Why this slice is safely isolated:
  - it defines orchestration and registry interfaces only, not behavior
- Test-first:
  - no

### S-005 — Parser, decode-plan, and decoder interface declarations
- Objective:
  - Declare the semantic HID model, decode-plan surface, and runtime decoder interface without implementing descriptor logic.
- Exact files likely to be created or modified:
  - `components/charm_core/include/charm/core/hid_semantic_model.hpp`
  - `components/charm_core/include/charm/core/decode_plan.hpp`
  - `components/charm_core/include/charm/core/hid_decoder.hpp`
  - `components/charm_core/CMakeLists.txt`
- Contracts involved:
  - `RawDescriptorRef`
  - `SemanticDescriptorModel`
  - `CollectionDescriptor`
  - `FieldDescriptor`
  - `DecodePlanInput`
  - `DecodePlan`
  - `DecodeReportRequest` / `DecodeReportResult`
- Dependencies:
  - S-001
  - S-002
- Acceptance criteria:
  - parser and decoder declarations are separated from transport and persistence concerns
  - stable semantic identity requirements are reflected in declarations
  - no parser-local numbering leaks into persistence-facing contracts
- Validation steps:
  - V1 review against `INTERFACES.md`
  - compile-only validation
  - identity-rule spot check
- Rollback impact if it fails:
  - low
- Why this slice is safely isolated:
  - it defines parser/decoder boundaries only
- Test-first:
  - no

### S-006 — Logical state, mapping, profile, and config-compiler interface declarations
- Objective:
  - Declare the remaining pure-core interfaces required before pure behavior can be implemented.
- Exact files likely to be created or modified:
  - `components/charm_core/include/charm/core/logical_state.hpp`
  - `components/charm_core/include/charm/core/mapping_bundle.hpp`
  - `components/charm_core/include/charm/core/mapping_engine.hpp`
  - `components/charm_core/include/charm/core/profile_manager.hpp`
  - `components/charm_core/include/charm/core/config_compiler.hpp`
  - `components/charm_core/CMakeLists.txt`
- Contracts involved:
  - `LogicalGamepadState`
  - `AxisState`
  - `ButtonState`
  - `TriggerState`
  - `HatState`
  - `MappingBundleRef`
  - mapping engine request/result shapes
  - profile selection and encoding request/result shapes
  - config validation/compile request/result shapes
- Dependencies:
  - S-001
  - S-002
  - S-003
- Acceptance criteria:
  - all remaining pure-core contracts are declared
  - logical state remains transport-independent
  - profile and config-compiler declarations do not imply unresolved decisions as implementation facts
- Validation steps:
  - V1 review against `INTERFACES.md`
  - compile-only validation
  - transport-independence spot check
- Rollback impact if it fails:
  - low
- Why this slice is safely isolated:
  - it completes declarations without introducing behavior
- Test-first:
  - no

### S-007 — Test-support foundation for pure-core modules
- Objective:
  - Add the minimum test-support layer needed to unit-test pure-core modules without binding them to real adapters.
- Exact files likely to be created or modified:
  - `components/charm_test_support/CMakeLists.txt`
  - `components/charm_test_support/include/charm/test_support/fake_time_port.hpp`
  - `components/charm_test_support/include/charm/test_support/fake_config_store_port.hpp`
  - `components/charm_test_support/include/charm/test_support/fake_usb_host_port.hpp`
  - `components/charm_test_support/include/charm/test_support/fake_ble_transport_port.hpp`
  - `tests/unit/CMakeLists.txt`
- Contracts involved:
  - approved port interfaces only
- Dependencies:
  - S-003
  - S-004
  - S-005
  - S-006
- Acceptance criteria:
  - test-support types satisfy port boundaries without leaking into production contracts
  - no production behavior is introduced
  - test-support does not define product logic
- Validation steps:
  - V2 compile and link validation for test-support only
  - fake-to-port conformance review
- Rollback impact if it fails:
  - low
- Why this slice is safely isolated:
  - it is explicitly test infrastructure and not production logic
- Test-first:
  - no

### S-008 — Device registry implementation
- Objective:
  - Implement only runtime device/interface registration, lookup, and decode-plan association behavior.
- Exact files likely to be created or modified:
  - `components/charm_core/src/device_registry.cpp`
  - `components/charm_core/include/charm/core/device_registry.hpp`
  - `components/charm_core/CMakeLists.txt`
  - `tests/unit/test_device_registry.cpp`
- Contracts involved:
  - registry request/result shapes
  - `DeviceHandle`
  - `InterfaceHandle`
  - `DecodePlanRef`
- Dependencies:
  - S-004
  - S-007
- Acceptance criteria:
  - runtime handles remain stable for active enumeration lifetime
  - decode-plan association is supported without persistence
  - implementation does not assume parser-local numbering
- Validation steps:
  - V2 unit tests for registration, lookup, detach, and capacity/error paths
  - contract review against `INTERFACES.md`
- Rollback impact if it fails:
  - low to medium; registry implementation can be removed without affecting adapters
- Why this slice is safely isolated:
  - it is pure-core runtime state with no adapter, parser, or transport logic
- Test-first:
  - yes

### S-009 — HID semantic descriptor model implementation
- Objective:
  - Implement only semantic descriptor parsing/model construction needed to represent HID semantics and stable identity inputs.
- Exact files likely to be created or modified:
  - `components/charm_core/src/hid_semantic_model.cpp`
  - `components/charm_core/include/charm/core/hid_semantic_model.hpp`
  - `components/charm_core/CMakeLists.txt`
  - `tests/unit/test_hid_semantic_model.cpp`
- Contracts involved:
  - `RawDescriptorRef`
  - `SemanticDescriptorModel`
  - `CollectionDescriptor`
  - `FieldDescriptor`
  - stable identity inputs used by `ElementKey`
- Dependencies:
  - S-005
  - S-007
- Acceptance criteria:
  - the same descriptor input yields the same semantic model
  - semantic output is sufficient to derive stable identity inputs
  - no decode, mapping, or transport logic is introduced
- Validation steps:
  - V2 unit tests for deterministic semantic output and malformed/unsupported descriptor cases
- Rollback impact if it fails:
  - medium; only parser model work is removed
- Why this slice is safely isolated:
  - it implements semantic parsing only and does not decode reports
- Test-first:
  - yes

### S-010 — Decode-plan builder implementation
- Objective:
  - Implement only deterministic conversion from semantic descriptor model to decode-plan structures.
- Exact files likely to be created or modified:
  - `components/charm_core/src/decode_plan.cpp`
  - `components/charm_core/include/charm/core/decode_plan.hpp`
  - `components/charm_core/CMakeLists.txt`
  - `tests/unit/test_decode_plan.cpp`
- Contracts involved:
  - `SemanticDescriptorModel`
  - `DecodePlanInput`
  - `DecodePlan`
- Dependencies:
  - S-005
  - S-009
  - S-007
- Acceptance criteria:
  - decode plans are deterministic for the same semantic model
  - decode plans preserve stable identity mapping requirements
  - no report-decoding, mapping, or transport behavior is introduced
- Validation steps:
  - V2 unit tests for deterministic plan generation and identity mapping coverage
- Rollback impact if it fails:
  - medium
- Why this slice is safely isolated:
  - it transforms semantic data into runtime decode metadata only
- Test-first:
  - yes

### S-011 — HID report decoder implementation
- Objective:
  - Implement only report-to-canonical-event decoding using an approved decode plan.
- Exact files likely to be created or modified:
  - `components/charm_core/src/hid_decoder.cpp`
  - `components/charm_core/include/charm/core/hid_decoder.hpp`
  - `components/charm_core/CMakeLists.txt`
  - `tests/unit/test_hid_decoder.cpp`
- Contracts involved:
  - `RawHidReportRef`
  - `DecodePlan`
  - `InputElementEvent`
- Dependencies:
  - S-005
  - S-010
  - S-007
- Acceptance criteria:
  - decoder emits canonical input events only
  - decoder does not merge devices
  - decoder does not pack BLE reports or touch persistence
- Validation steps:
  - V2 unit tests for valid decode paths, malformed report paths, and report-length mismatch paths
- Rollback impact if it fails:
  - medium
- Why this slice is safely isolated:
  - it converts raw reports to canonical events and stops there
- Test-first:
  - yes

### S-012 — Logical gamepad state container implementation
- Objective:
  - Implement only the canonical logical-state container and reset/read semantics.
- Exact files likely to be created or modified:
  - `components/charm_core/src/logical_state.cpp`
  - `components/charm_core/include/charm/core/logical_state.hpp`
  - `components/charm_core/CMakeLists.txt`
  - `tests/unit/test_logical_state.cpp`
- Contracts involved:
  - `LogicalGamepadState`
  - `AxisState`
  - `ButtonState`
  - `TriggerState`
  - `HatState`
  - `LogicalStateSnapshot`
- Dependencies:
  - S-006
  - S-007
- Acceptance criteria:
  - state remains transport-independent
  - range/initialization rules are enforced at the contract level
  - no mapping, profile, or adapter logic is introduced
- Validation steps:
  - V2 unit tests for initialization, reset, snapshot, and range-contract behavior
- Rollback impact if it fails:
  - low to medium
- Why this slice is safely isolated:
  - it implements storage for canonical state only
- Test-first:
  - yes

### S-013 — Mapping bundle validator/loader implementation
- Objective:
  - Implement only loading and validating compiled mapping-bundle metadata needed by the mapping engine.
- Exact files likely to be created or modified:
  - `components/charm_core/src/mapping_bundle.cpp`
  - `components/charm_core/include/charm/core/mapping_bundle.hpp`
  - `components/charm_core/CMakeLists.txt`
  - `tests/unit/test_mapping_bundle.cpp`
- Contracts involved:
  - `MappingBundleRef`
  - `CompiledMappingBundle`
  - bundle integrity/version metadata
- Dependencies:
  - S-006
  - S-007
- Acceptance criteria:
  - mapping-bundle metadata can be loaded/validated without storage or compiler placement assumptions
  - no event-application or profile logic is introduced
- Validation steps:
  - V2 unit tests for version/integrity acceptance and rejection paths
- Rollback impact if it fails:
  - low to medium
- Why this slice is safely isolated:
  - it handles mapping-bundle metadata only
- Test-first:
  - yes

### S-014 — Mapping engine base implementation
- Objective:
  - Implement only canonical event application into canonical logical state using an approved active mapping bundle.
- Exact files likely to be created or modified:
  - `components/charm_core/src/mapping_engine.cpp`
  - `components/charm_core/include/charm/core/mapping_engine.hpp`
  - `components/charm_core/CMakeLists.txt`
  - `tests/unit/test_mapping_engine.cpp`
- Contracts involved:
  - `InputElementEvent`
  - `MappingBundleRef`
  - `LogicalGamepadState`
  - mapping request/result shapes
- Dependencies:
  - S-006
  - S-012
  - S-013
  - S-007
- Acceptance criteria:
  - mapping output is canonical logical state only
  - no BLE packing, parser internals, or adapter calls appear in the implementation
  - engine behavior remains unit-testable without hardware
- Validation steps:
  - V2 unit tests for direct event application, contract violations, and missing/rejected bundle paths
- Rollback impact if it fails:
  - medium
- Why this slice is safely isolated:
  - it is pure-core behavior and has no adapter or transport dependencies
- Test-first:
  - yes

### S-015 — Profile catalog and first output encoder implementation
- Objective:
  - Implement only profile selection metadata and the first approved output encoder.
- Exact files likely to be created or modified:
  - `components/charm_core/src/profile_manager.cpp`
  - `components/charm_core/src/profile_generic_gamepad_encoder.cpp`
  - `components/charm_core/include/charm/core/profile_manager.hpp`
  - `components/charm_core/CMakeLists.txt`
  - `tests/unit/test_profile_manager.cpp`
  - `tests/unit/test_profile_generic_gamepad_encoder.cpp`
- Contracts involved:
  - `ProfileId`
  - `ProfileDescriptor`
  - `EncodedInputReport`
  - profile request/result shapes
- Dependencies:
  - S-006
  - S-012
  - U-002 must be explicitly decided or explicitly deferred with a single approved first profile
- Acceptance criteria:
  - one approved initial profile is encoded from canonical logical state
  - profile selection remains explicit and versionable
  - no USB parsing or mapping logic is introduced
- Validation steps:
  - V2 unit tests for profile selection and encoding behavior
- Rollback impact if it fails:
  - medium
- Why this slice is safely isolated:
  - it is transport-packing logic only and consumes canonical state
- Test-first:
  - yes

### S-016 — Supervisor state machine implementation
- Objective:
  - Implement only mode transitions, activation sequencing, and recovery state handling at the supervisor level.
- Exact files likely to be created or modified:
  - `components/charm_core/src/supervisor.cpp`
  - `components/charm_core/include/charm/core/supervisor.hpp`
  - `components/charm_core/CMakeLists.txt`
  - `tests/unit/test_supervisor.cpp`
- Contracts involved:
  - `SupervisorState`
  - `ModeState`
  - `RecoveryState`
  - activation/selection request/result shapes
  - `ControlPlaneEvent`
- Dependencies:
  - S-004
  - S-007
  - S-013
  - S-014
  - S-015 only if profile activation is part of the selected first integration path
- Acceptance criteria:
  - run/config modes remain mutually exclusive
  - supervisor coordinates state only and does not absorb parser, mapping, or encoding logic
  - recovery state entry/exit follows approved contract rules
- Validation steps:
  - V2 unit tests for mode transitions, invalid-state paths, and recovery transitions
- Rollback impact if it fails:
  - medium
- Why this slice is safely isolated:
  - it implements orchestration behavior only and can be tested with fakes
- Test-first:
  - yes

### S-017 — Platform time adapter implementation
- Objective:
  - Implement only the platform monotonic time adapter behind the time port.
- Exact files likely to be created or modified:
  - `components/charm_platform_time/CMakeLists.txt`
  - `components/charm_platform_time/include/charm/platform/time_port_esp_idf.hpp`
  - `components/charm_platform_time/src/time_port_esp_idf.cpp`
- Contracts involved:
  - time port
  - `Timestamp`
  - `Duration`
- Dependencies:
  - S-003
- Acceptance criteria:
  - adapter satisfies the approved time port only
  - no other platform services are introduced
  - no core contracts are modified
- Validation steps:
  - V3 compile/integration validation for the adapter component
  - monotonic-source review against the port contract
- Rollback impact if it fails:
  - low
- Why this slice is safely isolated:
  - it is a thin adapter with one responsibility
- Test-first:
  - no

### S-018 — Config-store adapter implementation
- Objective:
  - Implement only durable config-store behavior behind the storage port.
- Exact files likely to be created or modified:
  - `components/charm_platform_storage/CMakeLists.txt`
  - `components/charm_platform_storage/include/charm/platform/config_store_nvs.hpp`
  - `components/charm_platform_storage/src/config_store_nvs.cpp`
- Contracts involved:
  - config store port
  - `PersistedConfigRecord`
  - `ConfigVersion`
  - `IntegrityMetadata`
  - selected profile and mapping-bundle persistence boundaries
- Dependencies:
  - S-003
  - U-006 must be explicitly decided or deferred with an approved minimal durable schema
- Acceptance criteria:
  - adapter persists only approved durable records
  - core contracts do not take a dependency on NVS details
  - incompatible/corrupt records can be rejected at the boundary
- Validation steps:
  - V3 adapter integration validation
  - V2 unit tests only if a pure record codec is separated as a contract-preserving helper
- Rollback impact if it fails:
  - medium
- Why this slice is safely isolated:
  - it is a storage-boundary implementation only
- Test-first:
  - no

### S-019 — USB host adapter implementation
- Objective:
  - Implement only normalized enumeration, descriptor delivery, report delivery, and serialized teardown behavior behind the USB host port.
- Exact files likely to be created or modified:
  - `components/charm_platform_usb/CMakeLists.txt`
  - `components/charm_platform_usb/include/charm/platform/usb_host_adapter.hpp`
  - `components/charm_platform_usb/src/usb_host_adapter.cpp`
- Contracts involved:
  - USB host port
  - `UsbEnumerationInfo`
  - `DeviceDescriptorRef`
  - `InterfaceDescriptorRef`
  - `RawDescriptorRef`
  - `RawHidReportRef`
- Dependencies:
  - S-003
  - U-007 must be explicitly decided or deferred with an approved claim-policy minimum
- Acceptance criteria:
  - callbacks enqueue normalized facts only
  - teardown remains serialized through adapter-owned context
  - no parser or mapping logic is introduced
- Validation steps:
  - V3 adapter integration validation
  - manual callback/teardown review against `DECISIONS.md`
- Rollback impact if it fails:
  - medium
- Why this slice is safely isolated:
  - it is a single adapter boundary and does not implement core behavior
- Test-first:
  - no

### S-020 — BLE transport adapter implementation
- Objective:
  - Implement only advertising, peer lifecycle, and report-notify behavior behind the BLE transport port.
- Exact files likely to be created or modified:
  - `components/charm_platform_ble/CMakeLists.txt`
  - `components/charm_platform_ble/include/charm/platform/ble_transport_adapter.hpp`
  - `components/charm_platform_ble/src/ble_transport_adapter.cpp`
- Contracts involved:
  - BLE transport port
  - `BleTransportStatus`
  - `EncodedInputReport`
  - `BlePeerInfo`
  - `BondingMaterialRef`
- Dependencies:
  - S-003
  - U-001 must be explicitly decided or deferred with an approved single-adapter starting point
- Acceptance criteria:
  - adapter accepts profile-encoded bytes only
  - no descriptor parsing, mapping, or profile logic is introduced
  - bonding material remains behind the storage boundary
- Validation steps:
  - V3 adapter integration validation
  - adapter-boundary review against `INTERFACES.md`
- Rollback impact if it fails:
  - medium
- Why this slice is safely isolated:
  - it is transport-boundary implementation only
- Test-first:
  - no

### S-021 — Thin app bootstrap and run-mode wiring
- Objective:
  - Add the thinnest possible application bootstrap that wires approved modules together for run-mode startup without broad behavior changes.
- Exact files likely to be created or modified:
  - `components/charm_app/CMakeLists.txt`
  - `components/charm_app/include/charm/app/app_bootstrap.hpp`
  - `components/charm_app/src/app_bootstrap.cpp`
  - `main/main.cpp`
  - `main/CMakeLists.txt`
- Contracts involved:
  - supervisor
  - ports
  - mapping engine
  - profile manager
  - time adapter
- Dependencies:
  - S-014
  - S-016
  - S-017
  - S-019
  - S-020
  - S-015 if encoded output is part of the selected run-mode path
- Acceptance criteria:
  - bootstrap performs thin wiring only
  - no hidden business logic is embedded in `main` or the bootstrap layer
  - module boundaries remain intact
- Validation steps:
  - V3 wiring validation
  - compile/integration validation for startup-only flow
- Rollback impact if it fails:
  - medium to high; rollback may temporarily remove runnable startup
- Why this slice is safely isolated:
  - it introduces wiring only after core behavior and adapters exist
- Test-first:
  - no

### S-022 — Config activation and persistence flow integration
- Objective:
  - Integrate loading, validating, and activating approved persisted config at application startup and during config-triggered transitions.
- Exact files likely to be created or modified:
  - `components/charm_app/include/charm/app/config_activation.hpp`
  - `components/charm_app/src/config_activation.cpp`
  - `components/charm_app/src/app_bootstrap.cpp`
  - `tests/unit/test_config_activation.cpp`
- Contracts involved:
  - config store port
  - mapping-bundle activation contracts
  - profile-selection contracts
  - config-validation/compile results
- Dependencies:
  - S-013
  - S-016
  - S-018
  - U-003 and U-006 must be explicitly decided or explicitly deferred in a way that does not block activation
- Acceptance criteria:
  - config activation follows approved supervisor and persistence boundaries
  - invalid or incompatible persisted config is rejected cleanly
  - no storage details leak into core contracts
- Validation steps:
  - V2 unit tests with fake store and fake supervisor dependencies
  - V3 wiring validation in bootstrap path
- Rollback impact if it fails:
  - medium
- Why this slice is safely isolated:
  - it integrates config lifecycle only and does not expand parser/mapping/adapter responsibilities
- Test-first:
  - yes

### S-023 — Recovery and fault integration
- Objective:
  - Integrate approved fault categories and recovery transitions without expanding module responsibilities.
- Exact files likely to be created or modified:
  - `components/charm_core/include/charm/core/recovery_policy.hpp`
  - `components/charm_core/src/recovery_policy.cpp`
  - `components/charm_core/src/supervisor.cpp`
  - `components/charm_app/src/app_bootstrap.cpp`
  - `tests/unit/test_recovery_policy.cpp`
- Contracts involved:
  - `FaultEvent`
  - `FaultCode`
  - `RecoveryState`
  - recovery request/result shapes
- Dependencies:
  - S-016
  - S-021
  - approved fault/recovery policy boundaries
- Acceptance criteria:
  - recovery behavior follows supervisor contract boundaries
  - adapters still surface faults only through approved events/results
  - no module absorbs another module’s responsibility
- Validation steps:
  - V2 unit tests for recovery policy behavior
  - V3 integration validation for fault-to-recovery transitions
- Rollback impact if it fails:
  - medium
- Why this slice is safely isolated:
  - it focuses only on fault/recovery coordination
- Test-first:
  - yes

### S-024 — Manual hardware validation pass
- Objective:
  - Execute the first approved manual hardware validation once a runnable path exists.
- Exact files likely to be created or modified:
  - `VALIDATION.md`
  - `CHANGELOG_AI.md`
- Contracts involved:
  - no new code contracts; this slice validates previously implemented ones
- Dependencies:
  - S-021
  - S-023
  - approved hardware setup
- Acceptance criteria:
  - exact hardware/setup is recorded
  - expected and actual outcomes are recorded
  - regressions and anomalies are captured explicitly
- Validation steps:
  - V4 manual validation only
- Rollback impact if it fails:
  - low for repo state, high for delivery confidence
- Why this slice is safely isolated:
  - it records validation evidence rather than altering core architecture
- Test-first:
  - no

## Ranked Execution Order
| Order | Slice | Status | Test-first | Notes |
|---|---|---|---|---|
| 1 | S-001 | ready | no | best first slice |
| 2 | S-002 | queued | no | depends on S-001 |
| 3 | S-003 | queued | no | depends on S-001 and S-002 |
| 4 | S-004 | queued | no | depends on S-001 to S-003 |
| 5 | S-005 | queued | no | depends on S-001 and S-002 |
| 6 | S-006 | queued | no | depends on S-001 to S-003 |
| 7 | S-007 | queued | no | depends on S-003 to S-006 |
| 8 | S-008 | queued | yes | depends on S-004 and S-007 |
| 9 | S-009 | queued | yes | depends on S-005 and S-007 |
| 10 | S-010 | queued | yes | depends on S-009 and S-007 |
| 11 | S-011 | queued | yes | depends on S-010 and S-007 |
| 12 | S-012 | queued | yes | depends on S-006 and S-007 |
| 13 | S-013 | queued | yes | depends on S-006 and S-007 |
| 14 | S-014 | queued | yes | depends on S-012, S-013, and S-007 |
| 15 | S-015 | done | yes | implemented in S-015 PR |
| 16 | S-016 | done | yes | implemented in S-016 PR |
| 17 | S-017 | done | no | implemented in S-017 PR |
| 18 | S-018 | blocked | no | blocked on U-006 |
| 19 | S-019 | done | no | implemented in S-019 PR |
| 20 | S-020 | blocked | no | blocked on U-001 |
| 21 | S-021 | blocked | no | depends on S-015, S-016, S-017, S-019, S-020 |
| 22 | S-022 | blocked | yes | blocked on U-003 and U-006 |
| 23 | S-023 | blocked | yes | depends on S-016 and S-021 |
| 24 | S-024 | blocked | no | depends on runnable integrated path |

## Best First Slice
- Selected first slice: `S-001 — Shared core contract code foundation`
- Why:
  - it is the smallest code-bearing slice with the lowest regression risk
  - it does not depend on unresolved architecture decisions
  - it creates the minimum durable foundation required for every later slice
  - failure is cheap to roll back

## Conceptual CURRENT_TASK Update
`CURRENT_TASK.md` should point to `S-001 — Shared core contract code foundation` as the single active next execution target.

## Exact Next Prompt
Use this exact prompt for the next turn:

```text
Create a PR against main for Slice S-001 — Shared core contract code foundation.

Read:
- IMPLEMENTATION_SLICES.md
- CURRENT_TASK.md
- INTERFACES.md
- VALIDATION.md
- MEMORY.md

Execute only S-001.

Scope:
- create the minimal build/module scaffold required to host shared contract code
- implement only the shared scalar, identity, status, and error contract definitions listed for S-001

Do not:
- implement request/response shapes
- implement event/message contracts
- implement ports
- implement supervisor, registry, parser, decoder, mapping, profile, compiler, adapters, or app wiring
- add runtime behavior
- add tests unless they are absolutely required for the scaffold to compile
- broaden the slice

Before changing files:
- list the exact files you will touch
- explain why each file must change
- restate the acceptance criteria and validation steps for S-001

At the end:
- open a PR against main
- update CURRENT_TASK.md, TODO.md, and CHANGELOG_AI.md to reflect only S-001
- report the PR number and any assumptions made
```
