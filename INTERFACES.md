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

## Firmware Boundary Protection (Web Restart)
Protected firmware paths are out of scope for WR slices:
- `components/**`
- `main/**`
- `tests/**`
- root `CMakeLists.txt`
- firmware-related `.github/workflows/**`

Rule:
- Web restart slices may update only replacement webapp/docs/tooling/control files unless explicitly approved otherwise.

## Web Replacement Contract Boundary (WR track)

### Public Interfaces
- Browser-to-device connection via Web Serial.
- Browser-side controller state validation via Gamepad API.
- Firmware artifact ingestion through approved artifact source modes only.

### Artifact Source Modes
- `same_site_manifest`
  - Supported.
  - Source: static files served from the same deployment origin/path as replacement webapp.
  - Required manifest path contract: relative same-site path (e.g., `./firmware/manifest.json`).
- `manual_local_import`
  - Supported.
  - Source: operator-selected local files via browser file input.
  - Must enforce same required artifact set and validation rules as same-site mode.
- `live_github_actions_api`
  - Not supported.
  - Runtime dependence on live GitHub Actions/REST APIs is disallowed.

### Minimum Required Artifact Set
- `manifest.json`
- `bootloader.bin`
- `partition-table.bin`
- `charm.bin`

No other artifact type is required or implied by this contract.

### Data Contracts
- `FirmwareManifestRef`
  - Required fields: `version`, `build_time`, `commit_sha`, `target`, `files` mapping for `bootloader`, `partition_table`, `app`.
- `FirmwareArtifactBundle`
  - Required binary payloads: bootloader, partition table, app.
- `FlashLayoutRef`
  - Legacy accepted offsets for now:
    - bootloader -> `0x0000`
    - partition table -> `0x8000`
    - app -> `0x10000`
- `ArtifactSourceMode`
  - `same_site_manifest` | `manual_local_import`
- `BlockingReason`
  - explicit reason code + human-readable message for blocked capabilities.

### Request / Response Shapes
- `SelectArtifactSourceMode` / `SelectArtifactSourceModeResult`
- `FetchFirmwareManifest` / `FetchFirmwareManifestResult`
- `LoadLocalArtifacts` / `LoadLocalArtifactsResult`
- `ResolveArtifactBundle` / `ResolveArtifactBundleResult`
- `ValidateArtifactBundle` / `ValidateArtifactBundleResult`
- `RequestSerialPort` / `RequestSerialPortResult`
- `OpenSerialSession` / `OpenSerialSessionResult`
- `CloseSerialSession` / `CloseSerialSessionResult`
- `ReadGamepadSnapshot` / `ReadGamepadSnapshotResult`
- `ConfigTransportLoadRequest` / `ConfigTransportLoadResult`
- `ConfigTransportPersistRequest` / `ConfigTransportPersistResult`
- `ConfigTransportClearRequest` / `ConfigTransportClearResult`

### Event / Message Shapes
- `ArtifactEvent`
  - `source_selected`, `manifest_loaded`, `bundle_resolved`, `bundle_validation_failed`.
- `WebTransportEvent`
  - `serial_available`, `serial_opened`, `serial_closed`, `serial_error`.
- `GamepadEvent`
  - `gamepad_connected`, `gamepad_disconnected`, `snapshot_updated`.
- `CapabilityBlockEvent`
  - emitted when an action is intentionally blocked by contract policy.

### Persistence Boundaries
- No backend persistence.
- Browser-local state may cache transient UI/session values only.
- Device config write/persist is blocked until host/device runtime transport proof exists in-repo.

### External Adapter Boundaries
- Web Serial is the primary browser/device integration path.
- Gamepad API is the primary browser-side tester path.
- Browser BLE config/test paths are non-primary and blocked unless repo evidence proves a usable transport.

### Invariants and Validation Rules
- Replacement webapp was built in parallel first and is now cut over as active runtime at `web/`; legacy `web/` internals are retired.
- Artifact ingestion must use one of the approved source modes only.
- Artifact validation rules are mode-agnostic (same-site and manual-local must validate equivalently).
- Config write/persist actions must fail closed with explicit `blocked_unproven_transport` status while runtime transport is unproven.
- No assumptions of backend services, auth, or cloud APIs.

### Repo-Proven Internal Config Contract Anchoring (not runtime transport proof)
Evidence source:
- `PersistConfigRequest` / `PersistConfigResult` and `LoadConfigRequest` / `LoadConfigResult` contracts. (`components/charm_contracts/include/charm/contracts/requests.hpp`)
- `ConfigStorePort` firmware port boundary (`LoadConfig`, `PersistConfig`, `ClearConfig`, `PeekPersistedConfig`). (`components/charm_ports/include/charm/ports/config_store_port.hpp`)
- NVS-backed implementation semantics in `ConfigStoreNvs` (`kOk`/`kFailed` outcomes for persist/load/clear). (`components/charm_platform_storage/src/config_store_nvs.cpp`)

Contract mapping:
- `ConfigTransportPersistRequest`
  - required: `mapping_bundle` (maps to `MappingBundleRef`), `profile_id` (maps to `ProfileId`)
  - optional: `bonding_material` bytes
- `ConfigTransportPersistResult`
  - status mapping:
    - `ok` -> `ContractStatus::kOk`
    - `rejected` -> `ContractStatus::kRejected`
    - `failed` -> `ContractStatus::kFailed`
  - fault mapping:
    - category/reason mirror firmware `FaultCode`
- `ConfigTransportLoadRequest`
  - no payload
- `ConfigTransportLoadResult`
  - status + `mapping_bundle` + `profile_id` + optional `bonding_material` (maps directly to `LoadConfigResult`)
- `ConfigTransportClearRequest`
  - no payload
- `ConfigTransportClearResult`
  - status + fault (maps to `ClearConfigResult`)

Transport behavior requirements:
- The mapping above defines schema parity only and does not prove browser runtime transport availability.
- Any future transport adapter must preserve request/response field names and semantics above; no lossy translation.
- Any future transport adapter must surface `ContractStatus` and `FaultCode` without collapsing categories.
- Persist/load/clear must not mutate flash/console session ownership state.
- Current runtime status must remain `blocked_unproven_transport`.

### Error Categories
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

### Allowed Dependencies (WR track)
- Replacement web UI/state modules -> browser APIs (Web Serial, Gamepad API) and static/local artifact adapters.
- Validation modules -> read-only consumption of browser state and explicit contract checks.

### Forbidden Dependencies (WR track)
- WR slices must not depend on firmware source changes.
- WR slices must not invent config payload fields beyond `PersistConfigRequest` / `LoadConfigResult` / `ClearConfigResult` contracts.
- WR slices must not claim runtime transport support without concrete host/device protocol evidence in repo.
- WR slices must not treat BLE browser paths as implementable config/test transport without repo proof.
- WR runtime contracts must not depend on live GitHub Actions APIs.

## Change Rule
Update this file only when a contract, dependency rule, boundary, invariant, or error category is approved or changed.
