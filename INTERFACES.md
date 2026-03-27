# INTERFACES.md

## Purpose
Define the complete implementation boundary before any logic is written.
This file contains interface boundaries, shared contracts, dependency rules, invariants, and boundary-level error categories only.

## Contract Inventory

### Shared Contracts

#### Shared Data Contracts
- `ElementKey`
  - Stable semantic identity for one physical HID element
  - Identity inputs may include: vendor/product identity, hub path, interface number, report id, usage page, usage, collection index, logical index
- `ElementKeyHash`
  - Stable persisted hash of `ElementKey`
  - Used for persistence, config compilation, and cross-session lookup
- `DeviceHandle`
  - Stable runtime identity for one enumerated physical device/interface claim
- `InterfaceHandle`
  - Stable runtime identity for one claimed HID interface
- `ReportMeta`
  - Report identity metadata such as report id, report type, and declared length
- `Timestamp`
  - Monotonic time value used by core contracts
- `FaultCode`
  - Structured fault category and reason value
- `ProfileId`
  - Stable selected output-profile identity
- `MappingBundleRef`
  - Active compiled mapping bundle reference plus integrity/version metadata

#### Shared Request / Response Shapes
- `StartRequest` / `StartResult`
- `StopRequest` / `StopResult`
- `ActivateMappingBundleRequest` / `ActivateMappingBundleResult`
- `SelectProfileRequest` / `SelectProfileResult`
- `PersistConfigRequest` / `PersistConfigResult`
- `LoadConfigRequest` / `LoadConfigResult`
- `ModeTransitionRequest` / `ModeTransitionResult`
- `RecoveryRequest` / `RecoveryResult`

Rules:
- Request/response shapes may carry status and reason information
- Request/response shapes must not embed platform-native SDK types
- Request/response shapes must remain serialization-safe for logging, storage, and future tool integration

#### Shared Event / Message Shapes
- `ControlPlaneEvent`
  - Required fields: event type, timestamp, source/subsystem
  - Optional fields: device handle, interface handle, fault code, metadata payload
- `RawHidReportRef`
  - Required fields: device handle, interface handle, report metadata, byte length, timestamp, immutable bytes or immutable buffer reference
- `InputElementEvent`
  - Required fields: element key hash, element type, canonical value, timestamp, source device/interface
- `LogicalStateSnapshot`
  - Required fields: profile id, timestamp, canonical logical gamepad state
- `FaultEvent`
  - Required fields: fault category, fault code, severity, source, timestamp
- `AdapterStatusEvent`
  - Required fields: adapter kind, state, timestamp

Rules:
- Control-plane events do not own raw HID report buffers
- Data-plane messages must have explicit ownership and lifetime rules
- Event names must describe lifecycle or state transitions, not implementation details

#### Shared Persistence Boundaries
- Persisted mapping identity is `ElementKeyHash`-based
- Persisted config may store:
  - compiled mapping bundle
  - mapping bundle version/integrity metadata
  - selected profile id
  - adapter-owned BLE bonding material required by the chosen BLE adapter
- Persistence records must not require parser-local numbering
- Persistence records must not require platform SDK object serialization

#### Shared Invariants and Validation Rules
- Core-domain contracts contain no ESP-IDF-specific, USB-stack-specific, or BLE-stack-specific types
- Canonical gamepad state is transport-independent
- Translation contracts and transport contracts remain separate
- All hot-path contracts must support bounded deterministic use
- Any contract required for persistence must have stable versioning semantics before implementation begins

#### Shared Error Categories
- `invalid_request`
- `invalid_state`
- `unsupported_capability`
- `contract_violation`
- `resource_exhausted`
- `capacity_exceeded`
- `timeout`
- `integrity_failure`
- `persistence_failure`
- `adapter_failure`
- `transport_failure`
- `device_protocol_failure`
- `configuration_rejected`
- `recovery_required`

---

### Supervisor / Mode State Machine

#### Public Interfaces
- System lifecycle control
- Mode selection and mode transition control
- Mapping-bundle activation control
- Output-profile selection control
- Recovery entry/exit control
- Read-only status query surface

#### Data Contracts
- `SupervisorState`
- `ModeState`
- `ActiveProfileRef`
- `ActiveMappingBundleRef`
- `RecoveryState`
- `FaultRecordRef`

#### Request / Response Shapes
- `ModeTransitionRequest` / `ModeTransitionResult`
- `ActivateMappingBundleRequest` / `ActivateMappingBundleResult`
- `SelectProfileRequest` / `SelectProfileResult`
- `RecoveryRequest` / `RecoveryResult`

#### Event / Message Shapes
- Consumes `ControlPlaneEvent`
- Emits supervisor status transitions and fault-state transitions

#### Persistence Boundaries
- None directly
- Uses config-store contracts rather than storage implementation details

#### External Adapter Boundaries
- Talks only to port interfaces and shared contracts
- Does not call platform SDKs directly from the core domain

#### Invariants and Validation Rules
- Exactly one mode is active at a time
- Run mode and configuration mode are mutually exclusive
- Supervisor coordinates lifecycle only
- Supervisor does not absorb parsing, mapping, encoding, or transport logic

#### Error Categories
- `invalid_state`
- `dependency_unavailable`
- `activation_rejected`
- `configuration_rejected`
- `recovery_required`
- `timeout`

---

### Control-Plane Event Model

#### Public Interfaces
- Publish/consume lifecycle and fault events
- Publish/consume config and adapter status events
- Publish periodic tick/heartbeat events where approved

#### Data Contracts
- `ControlPlaneEvent`
- `FaultEvent`
- `AdapterStatusEvent`

#### Request / Response Shapes
- None required beyond event publication/acknowledgement semantics

#### Event / Message Shapes
Expected categories:
- device connected
- device disconnected
- BLE connected
- BLE disconnected
- config updated
- fault raised
- tick

#### Persistence Boundaries
- No direct persistence ownership

#### External Adapter Boundaries
- Receives normalized status/events from adapters through port contracts

#### Invariants and Validation Rules
- Control-plane messages are not raw data-plane payload containers
- Control-plane sequencing must be explicit enough to drive supervisor decisions

#### Error Categories
- `invalid_event`
- `event_drop`
- `ordering_violation`

---

### Device Registry

#### Public Interfaces
- Register enumerated devices/interfaces
- Resolve stable runtime device/interface handles
- Associate active decode plans with claimed interfaces
- Query active device/interface inventory

#### Data Contracts
- `DeviceHandle`
- `InterfaceHandle`
- `DeviceDescriptorRef`
- `InterfaceDescriptorRef`
- `RegistryEntry`
- `DecodePlanRef`

#### Request / Response Shapes
- `RegisterDeviceRequest` / `RegisterDeviceResult`
- `RegisterInterfaceRequest` / `RegisterInterfaceResult`
- `DetachDeviceRequest` / `DetachDeviceResult`
- `LookupDeviceRequest` / `LookupDeviceResult`
- `AttachDecodePlanRequest` / `AttachDecodePlanResult`

#### Event / Message Shapes
- Consumes device attach/detach lifecycle events
- Emits registry-state-change notifications only if required by supervisor/control plane

#### Persistence Boundaries
- Runtime only unless a future approved feature requires persisted inventory metadata
- No persisted dependency on transient handles

#### External Adapter Boundaries
- Receives normalized enumeration facts from the USB host port only

#### Invariants and Validation Rules
- Runtime handles are stable for the lifetime of the active enumeration
- Registry owns runtime association of interfaces to decode plans
- Registry is not a persistence format

#### Error Categories
- `duplicate_registration`
- `unknown_handle`
- `registry_capacity_exceeded`
- `state_conflict`

---

### HID Descriptor Parser

#### Public Interfaces
- Accept raw HID descriptor input
- Produce deterministic semantic descriptor model
- Produce deterministic decode-plan input

#### Data Contracts
- `RawDescriptorRef`
- `SemanticDescriptorModel`
- `CollectionDescriptor`
- `FieldDescriptor`
- `DecodePlanInput`

#### Request / Response Shapes
- `ParseDescriptorRequest` / `ParseDescriptorResult`

#### Event / Message Shapes
- May emit parser fault/status events to the control plane
- Does not emit BLE/profile events

#### Persistence Boundaries
- Parser-local structures are not persisted
- Persisted mappings must not require parser-local field numbering

#### External Adapter Boundaries
- Receives descriptor bytes/metadata from the USB host path only

#### Invariants and Validation Rules
- Same semantic descriptor input must yield the same semantic output
- Parser output must be sufficient to derive stable `ElementKey` identity
- Parser does not own transport, config, or persistence behavior

#### Error Categories
- `descriptor_unsupported`
- `descriptor_malformed`
- `descriptor_ambiguous`
- `identity_incomplete`

---

### HID Report Decoder

#### Public Interfaces
- Accept `RawHidReportRef`
- Use approved decode plan
- Emit canonical `InputElementEvent` values

#### Data Contracts
- `RawHidReportRef`
- `DecodePlan`
- `InputElementEvent`

#### Request / Response Shapes
- `DecodeReportRequest` / `DecodeReportResult`

#### Event / Message Shapes
- Emits zero or more `InputElementEvent`
- May emit decoder fault/status events to the control plane

#### Persistence Boundaries
- None directly
- Consumes persisted identity indirectly through the approved mapping bundle only after compile/activation

#### External Adapter Boundaries
- No direct dependency on BLE or storage
- No direct dependency on USB SDK types beyond adapter-normalized inputs

#### Invariants and Validation Rules
- Decoder emits canonical events only
- Decoder does not merge devices
- Decoder does not pack BLE reports
- Decoder does not mutate persisted mapping state

#### Error Categories
- `report_malformed`
- `report_length_mismatch`
- `decode_plan_missing`
- `decode_failure`

---

### Mapping Engine

#### Public Interfaces
- Accept canonical input events
- Apply approved active mapping bundle
- Update canonical logical gamepad state
- Expose read-only logical-state snapshot interface

#### Data Contracts
- `InputElementEvent`
- `MappingBundleRef`
- `LogicalGamepadState`
- `LogicalStateSnapshot`

#### Request / Response Shapes
- `ApplyInputEventRequest` / `ApplyInputEventResult`
- `GetLogicalStateRequest` / `GetLogicalStateResult`
- `ResetLogicalStateRequest` / `ResetLogicalStateResult`

#### Event / Message Shapes
- Consumes `InputElementEvent`
- Emits logical-state updates or snapshots only through canonical core contracts

#### Persistence Boundaries
- Consumes active compiled mapping bundle reference
- Does not write config storage
- Does not own mapping compilation

#### External Adapter Boundaries
- No direct dependency on USB host, BLE transport, NVS, or platform SDKs

#### Invariants and Validation Rules
- Mapping output is canonical `LogicalGamepadState` only
- Mapping engine is transport-agnostic
- Mapping engine is unit-testable without hardware
- Mapping engine must not depend on parser-local numbering

#### Error Categories
- `mapping_missing`
- `mapping_rejected`
- `logical_state_invalid`
- `contract_violation`

---

### Logical Gamepad State

#### Public Interfaces
- Read-only canonical logical state access
- Reset/clear interface if explicitly approved by supervisor lifecycle

#### Data Contracts
- `LogicalGamepadState`
- `AxisState`
- `ButtonState`
- `TriggerState`
- `HatState`

#### Request / Response Shapes
- `GetLogicalStateRequest` / `GetLogicalStateResult`
- `ResetLogicalStateRequest` / `ResetLogicalStateResult`

#### Event / Message Shapes
- `LogicalStateSnapshot`

#### Persistence Boundaries
- Runtime state is not persisted as transport-specific bytes
- Any future persisted profile/config linkage must reference profile id, not packed report bytes

#### External Adapter Boundaries
- Consumed by profile encoder only through canonical contracts

#### Invariants and Validation Rules
- State surface is canonical and profile-independent
- State normalization rules must be explicit before implementation
- No transport packing fields exist in this contract

#### Error Categories
- `state_uninitialized`
- `state_out_of_range`
- `state_contract_violation`

---

### Profile Manager / Report Encoder

#### Public Interfaces
- Select approved output profile
- Encode canonical logical state into profile-specific report bytes
- Expose profile capability metadata

#### Data Contracts
- `ProfileId`
- `ProfileDescriptor`
- `EncodedInputReport`
- `LogicalGamepadState`

#### Request / Response Shapes
- `SelectProfileRequest` / `SelectProfileResult`
- `EncodeLogicalStateRequest` / `EncodeLogicalStateResult`
- `GetProfileCapabilitiesRequest` / `GetProfileCapabilitiesResult`

#### Event / Message Shapes
- May emit profile selection/status events to the control plane

#### Persistence Boundaries
- Consumes selected profile id from config
- Does not own long-term storage

#### External Adapter Boundaries
- Supplies encoded report bytes to the BLE transport port only
- No direct dependency on USB parsing/decoding or platform BLE SDK APIs

#### Invariants and Validation Rules
- Encoder never parses USB descriptors
- Encoder never owns device merge logic
- Output profile selection must remain explicit and versionable

#### Error Categories
- `unknown_profile`
- `profile_unsupported`
- `encoding_failure`
- `capability_mismatch`

---

### Config Compiler / Web Flasher

#### Public Interfaces
- Validate mapping configuration input (via companion app)
- Compile approved mapping configuration into an immutable mapping bundle
- Fetch ESP-IDF firmware artifacts via GitHub API
- Flash firmware and mapping bundles to ESP32-S3 via Web Serial API
- Expose compile result metadata and diagnostics

#### Data Contracts
- `MappingConfigDocument`
- `CompileDiagnostics`
- `CompiledMappingBundle`
- `MappingBundleRef`
- Firmware ZIP format and offsets

#### Request / Response Shapes
- `CompileConfigRequest` / `CompileConfigResult`
- `ValidateConfigRequest` / `ValidateConfigResult`

#### Event / Message Shapes
- May emit config-validation/status events to the control plane (once flashed)

#### Persistence Boundaries
- Produces compiled bundle suitable for config-store persistence
- Does not own selected adapter persistence details

#### External Adapter Boundaries
- Implemented entirely in a standalone Web/JS environment (`web/`)
- Relies on browser-provided Web Serial and standard GitHub REST APIs

#### Invariants and Validation Rules
- Compiler output must be deterministic for the same approved config input
- Compiler diagnostics must not depend on platform-native types
- Web app must not require ESP-IDF or C++ compilation at runtime

#### Error Categories
- `config_invalid`
- `config_incomplete`
- `compile_failure`
- `flash_failure`
- `network_failure`

---

### USB Host Port

#### Public Interfaces
- Start host subsystem
- Stop host subsystem
- Apply interface-claim policy
- Deliver device attach/detach notifications
- Deliver interrupt-IN report payloads
- Deliver descriptor metadata required by parser setup

#### Data Contracts
- `UsbHostStatus`
- `UsbEnumerationInfo`
- `DeviceDescriptorRef`
- `InterfaceDescriptorRef`
- `RawDescriptorRef`
- `RawHidReportRef`

#### Request / Response Shapes
- `StartRequest` / `StartResult`
- `StopRequest` / `StopResult`
- `ClaimInterfaceRequest` / `ClaimInterfaceResult`

#### Event / Message Shapes
- device connected
- device disconnected
- descriptor available
- report received
- adapter fault

#### Persistence Boundaries
- None directly

#### External Adapter Boundaries
- Implemented by ESP-IDF USB host plus external hub support behind the port

#### Invariants and Validation Rules
- Core depends on the port, not ESP-IDF USB APIs
- Callbacks may enqueue events/report refs only
- Teardown flows through adapter-owned serialized context
- Enumeration details exposed to core must already be normalized

#### Error Categories
- `enumeration_failure`
- `claim_rejected`
- `transfer_failure`
- `adapter_failure`
- `resource_exhausted`

---

### BLE Transport Port

#### Public Interfaces
- Start advertising
- Stop advertising
- Notify input report payloads
- Publish connected/disconnected status
- Expose adapter readiness status required by supervisor

#### Data Contracts
- `BleTransportStatus`
- `EncodedInputReport`
- `BlePeerInfo`
- `BondingMaterialRef`

#### Request / Response Shapes
- `StartRequest` / `StartResult`
- `StopRequest` / `StopResult`
- `NotifyInputReportRequest` / `NotifyInputReportResult`

#### Event / Message Shapes
- advertising started
- advertising stopped
- peer connected
- peer disconnected
- transport fault

#### Persistence Boundaries
- Adapter-owned bonding material may be persisted through the config-store port
- Core does not own BLE-stack-native bond storage formats

#### External Adapter Boundaries
- Implemented by NimBLE, Bluedroid, or both behind the port

#### Invariants and Validation Rules
- Core depends on the port, not a concrete BLE stack
- Transport accepts profile-encoded bytes only
- Transport does not parse descriptors or perform input mapping

#### Error Categories
- `advertising_failure`
- `notification_failure`
- `bonding_failure`
- `transport_failure`
- `adapter_failure`

---

### Config Store Port

#### Public Interfaces
- Load persisted configuration
- Save persisted configuration
- Clear or reset persisted configuration where approved
- Expose integrity/version metadata

#### Data Contracts
- `PersistedConfigRecord`
- `CompiledMappingBundle`
- `ProfileId`
- `ConfigVersion`
- `IntegrityMetadata`
- `BondingMaterialRef`

#### Request / Response Shapes
- `LoadConfigRequest` / `LoadConfigResult`
- `PersistConfigRequest` / `PersistConfigResult`
- `ClearConfigRequest` / `ClearConfigResult`

#### Event / Message Shapes
- config loaded
- config saved
- persistence fault

#### Persistence Boundaries
- Owns durable representation only through the port
- Durable schema details remain unresolved until explicitly approved

#### External Adapter Boundaries
- Implemented by NVS or another approved persistence backend behind the port

#### Invariants and Validation Rules
- Core depends on the port, not NVS
- Persisted config identity must remain stable across firmware revisions
- Durable records must expose enough version/integrity information to reject incompatible or corrupt state

#### Error Categories
- `record_missing`
- `version_mismatch`
- `integrity_failure`
- `storage_full`
- `persistence_failure`

---

### Time Port

#### Public Interfaces
- Monotonic time access for core logic

#### Data Contracts
- `Timestamp`
- `Duration`

#### Request / Response Shapes
- `GetTimeRequest` / `GetTimeResult`

#### Event / Message Shapes
- None required beyond approved tick events if used by the control plane

#### Persistence Boundaries
- None

#### External Adapter Boundaries
- Implemented by platform monotonic time source behind the port

#### Invariants and Validation Rules
- Core depends on the port, not platform time APIs
- Time values used by core logic must be monotonic

#### Error Categories
- `time_unavailable`
- `time_non_monotonic`

---

## Dependency Map

### Allowed Dependencies
- Supervisor may depend on:
  - control-plane contracts
  - config-store port
  - USB host port
  - BLE transport port
  - time port
  - mapping-bundle/profile selection contracts
- Control-plane event model may depend on:
  - shared contract types only
- Device registry may depend on:
  - shared identity contracts
  - normalized enumeration contracts
  - decode-plan references
- HID descriptor parser may depend on:
  - raw descriptor contracts
  - shared HID semantic identity contracts
- HID report decoder may depend on:
  - decode plan
  - raw report contracts
  - shared event contracts
  - registry lookups required to resolve active interface context
- Mapping engine may depend on:
  - canonical input-event contracts
  - active mapping-bundle contracts
  - logical-state contracts
  - time port only if an approved mapping contract requires time
- Logical gamepad state module may depend on:
  - shared state contracts only
- Profile manager / report encoder may depend on:
  - logical-state contracts
  - approved profile contracts
- Config compiler may depend on:
  - mapping config schema contracts
  - stable HID identity schema
  - profile catalog contracts
- Port implementations may depend on:
  - shared contract types
  - platform SDKs needed to satisfy the port
- Config-store adapter may depend on:
  - approved persistence schema contracts
  - platform storage SDKs
- Time adapter may depend on:
  - platform monotonic time APIs

### Forbidden Dependencies
- Core-domain modules must not depend on ESP-IDF headers or platform SDK types
- Mapping engine must not depend on:
  - USB host port internals
  - BLE transport port internals
  - concrete BLE profiles
  - parser-local numbering
- HID parser/decoder must not depend on:
  - BLE transport
  - profile encoder
  - persistence backend details
- Profile encoder must not depend on:
  - USB descriptor parsing
  - device registry internals beyond approved state identity
  - mapping algorithms
- Supervisor must not depend on:
  - parser internals
  - mapping implementation internals
  - encoder packing internals
- Adapters must not expose platform SDK objects into core contracts
- Config-store contracts must not depend on transient runtime handles
- Control-plane event contracts must not become a dumping ground for raw report bytes or platform-native error objects

### Must Remain Isolated Behind Interfaces
- ESP-IDF USB host details
- External hub support details
- NimBLE/Bluedroid implementation details
- NVS record layout and storage APIs
- Platform monotonic time APIs
- BLE bonding storage representation
- Enumeration callback behavior and teardown sequencing
- Any future companion-web-app placement details for config compilation

## Change Rule
Update this file only when a contract, dependency rule, boundary, invariant, or error category is approved or changed.
