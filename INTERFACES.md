# INTERFACES.md

## Purpose
Define implementation boundaries before logic is written.
This file contains interface boundaries, shared contracts, dependency rules, invariants, and boundary-level error categories only.

## Shared Invariants (Repo-wide)
- Core-domain contracts contain no ESP-IDF-specific, USB-stack-specific, or BLE-stack-specific types.
- Translation contracts and transport contracts remain separate.
- Canonical gamepad state is transport-independent.
- Persisted mappings use stable semantic HID identity (`ElementKey`/`ElementKeyHash`).
- Hot-path behavior is bounded and deterministic.

## Program Boundary (Production Track)
- Runtime replacement webapp is active at `web/` (historical WR cutover complete).
- Production slices may update control/docs/contracts and then implementation in narrowly approved slices.
- No backend is introduced unless explicitly approved by decision.

## Runtime Web Contract Boundary

### Public Browser Interfaces
- Browser-to-device connection via Web Serial (primary).
- Browser-side validation via Gamepad API (primary).
- Firmware artifact ingestion via approved static/local modes only.

### Artifact Source Modes
- `same_site_manifest` (supported)
- `manual_local_import` (supported)
- `live_github_actions_api` (not supported at runtime)

### Minimum Required Artifact Set
- `manifest.json`
- `bootloader.bin`
- `partition-table.bin`
- `charm.bin`

### Persistence Boundaries
- No backend persistence.
- Browser-local state may cache transient UI/session values only.
- Device config write/persist is supported through the serial-first config transport path with ownership/capability gates.

### External Adapter Boundaries
- Web Serial remains primary browser/device integration path.
- Gamepad API remains primary browser-side tester path.
- Browser BLE config/test paths remain blocked unless repo evidence proves usable transport.
- Runtime web config transport must not bypass flash/console serial ownership rules.

## Config Transport Contract Anchoring (schema parity only)
Frozen first-path contract artifact:
- `CONFIG_TRANSPORT_CONTRACT.md` (`CFG-001`) defines the serial-primary v1 contract boundary.

Evidence source:
- `PersistConfigRequest` / `PersistConfigResult` and `LoadConfigRequest` / `LoadConfigResult` contracts (`components/charm_contracts/include/charm/contracts/requests.hpp`).
- `ConfigStorePort` boundary (`components/charm_ports/include/charm/ports/config_store_port.hpp`).
- NVS-backed semantics in `ConfigStoreNvs` (`components/charm_platform_storage/src/config_store_nvs.cpp`).

Mapping constraints:
- `ConfigTransportPersistRequest`: required `mapping_bundle`, `profile_id`; optional `bonding_material`.
- `ConfigTransportPersistResult`: status/fault must map losslessly to firmware contract outcomes.
- `ConfigTransportLoadRequest`: no payload.
- `ConfigTransportLoadResult`: status + config payload fields aligned to `LoadConfigResult`.
- `ConfigTransportClearRequest`: no payload.
- `ConfigTransportClearResult`: status + fault aligned to `ClearConfigResult`.

Transport behavior constraints:
- Schema parity does not itself prove runtime transport availability.
- Future transport adapter must preserve field names/semantics without lossy translation.
- Future transport adapter must surface `ContractStatus` and `FaultCode` without collapsing categories.
- Persist/load/clear must not mutate flash/console ownership state.
- Runtime remains `blocked_unproven_transport` until proof gates pass.
- First production config transport path is serial-primary; BLE config transport remains deferred unless separately proven.

CFG-002 implementation boundary:
- Firmware-side `ConfigTransportService` handles `config.persist/load/clear/get_capabilities` against `ConfigStorePort`.
- Request envelope validation currently includes protocol version, request id, and integrity metadata checks.
- Service scope excludes serial framing/parsing and excludes BLE config transport.

## Production Program Driver Interfaces (control-level)
The production program must define and validate interfaces for:
- BLE production transport behavior and acceptance gates.
- Host/device config transport proof evidence and acceptance gates.
- Web integration contract for enabling config upload/persist only after proof.
- CI/CD release/deployment evidence contract (build, artifact promotion, rollback readiness).
- Automated/manual validation evidence contract.
- Operations/runbook readiness contract.
- Final production audit contract.

## FW-001 BLE Production Behavior/Failure Contract (control-level)

### Required BLE Lifecycle States
- `ble_stopped`
- `ble_starting`
- `ble_advertising`
- `ble_connected`
- `ble_degraded`
- `ble_recovering`

### Required BLE Lifecycle Invariants
- Fail closed on unrecoverable BLE transport errors (no undefined output behavior).
- Deterministic transitions between lifecycle states (no hidden transitions).
- Transport adapter boundaries remain explicit; core translation stays transport-agnostic.
- No production-claim posture while required BLE evidence rows are incomplete.

### BLE Failure Classification (minimum)
- `ble_init_failure`
- `ble_advertise_failure`
- `ble_connection_drop`
- `ble_notify_failure`
- `ble_resource_exhaustion`
- `ble_recovery_timeout`

### BLE Recovery Expectations
- Each failure class must define expected transition path (`degraded`/`recovering`/`stopped`) and retry policy.
- Recovery attempts must be bounded and captured as validation evidence.
- Repeated unrecoverable failures must return to safe blocked posture (not partial-active behavior).

### FW-002 Scope Boundary (implemented)
- Implemented:
  - stack-backed lifecycle start/stop
  - advertising-readiness status surfacing
  - peer connect/disconnect status surfacing
  - lifecycle error/status surfacing through listener boundary
- Deferred:
  - full report-notify data path (`FW-003`)

### FW-003 Scope Boundary (implemented)
- Implemented:
  - encoded input reports accepted via existing `NotifyInputReport` boundary
  - report delivery delegated through BLE backend transport path
  - transport failures surfaced as status/fault through existing listener boundary
- Deferred:
  - real stack callback wiring for report-channel open/close hardening (`FW-004`)

### FW-004 Scope Boundary (implemented)
- Implemented:
  - report-channel callback integration for channel ready/closed transitions through backend boundaries
  - bounded adapter recovery attempts for lifecycle/report-path failures with fail-closed fallback posture
  - session-scoped bonding material set/get/clear behavior on BLE adapter boundary
- Deferred:
  - persistent bonding material storage/load wiring remains in transport/config proof slices

## Production-Ready Definition Interfaces (PROD-002)

### Release Stage Minimum Conditions
- Internal beta minimum:
  - runtime web at `web/` remains stable for current proven capabilities
  - firmware build/artifact publication path is operational
  - critical known blockers are explicitly tracked with owners and gates
- External beta minimum (if appropriate for release strategy):
  - internal beta minimum conditions pass
  - rollback path is documented and testable
  - manual hardware validation passes for declared beta matrix
- Production minimum:
  - real BLE output path is proven for production use
  - real host/device config write/persist path is proven where production scope requires runtime persistence
  - runtime web integration for proven transport paths is complete with fail-safe behavior
  - release/deployment hardening gates pass
  - artifact integrity/provenance gates pass
  - automated and manual validation gates pass
  - rollback readiness and operator/support docs are complete

### Mandatory Production Capabilities
- Production-safe BLE output transport behavior.
- Production-safe host/device config transport behavior when runtime persistence is in scope.
- Hardened release/deployment and rollback controls.
- Automated validation + manual hardware validation coverage.
- Operator/support documentation and incident/recovery runbooks.

### Required Production Evidence
- BLE production validation evidence (positive, negative, recovery).
- Host/device config transport proof evidence and integration evidence.
- CI/CD release/deployment hardening evidence.
- Artifact integrity/provenance evidence.
- Automated validation results and manual hardware matrix results.
- Rollback drill evidence and support/runbook completion evidence.

### Named Production Gates
- `PG-INT` (internal beta):
  - minimum conditions from this file’s internal-beta section must pass.
- `PG-EXT` (external beta, optional):
  - requires `PG-INT` pass plus rollback rehearsal + manual hardware matrix pass.
- `PG-PROD` (production):
  - requires proven real BLE path, proven config transport path where in production scope, hardened release path, integrity/provenance evidence, validation evidence, rollback readiness, and operator/support documentation completeness.

### Repo-Grounded Truth Constraints
- Current repo truth does **not** prove production BLE output behavior yet.
- Current repo truth does **not** prove production host/device config write/persist transport yet.
- Therefore `PG-PROD` remains closed until those proofs and associated evidence are complete.

## Error Categories
- `unsupported_browser_capability`
- `serial_permission_denied`
- `serial_open_failure`
- `serial_io_failure`
- `artifact_source_unsupported`
- `artifact_manifest_missing`
- `artifact_bundle_incomplete`
- `artifact_integrity_failure`
- `artifact_fetch_failure`
- `gamepad_unavailable`
- `blocked_unproven_transport`

## Dependency Rules

### Allowed Dependencies
- Web UI/state modules -> browser APIs (Web Serial, Gamepad API) and static/local artifact adapters.
- Validation modules -> read-only consumption of browser/firmware behavior and explicit contract checks.
- Control files -> approved decisions and repo-proven evidence.

### Forbidden Dependencies
- No claims of runtime config transport support without concrete host/device protocol evidence.
- No BLE browser-path enablement claims without repo proof.
- No runtime dependence on live GitHub Actions APIs.
- No backend assumptions unless explicitly approved.

## Change Rule
Update this file only when a contract, dependency rule, boundary, invariant, or error category is approved or changed.
