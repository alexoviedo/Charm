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

## Program Boundary (Vertical-Slice Track)
- Runtime replacement webapp is active at `web/`.
- Active execution program is `VS-01`..`VS-08`, tied to verified gaps G-001..G-006.
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

### Persistence Boundaries
- No backend persistence.
- Browser-local state may cache transient UI/session values only.
- Runtime web may issue config transport commands only through serial ownership/capability gates.

### External Adapter Boundaries
- Web Serial remains primary browser/device integration path.
- Gamepad API remains primary browser-side tester path.
- Browser BLE config/test paths remain blocked unless repo evidence proves usable transport.
- Runtime web config transport must not bypass flash/console serial ownership rules.

## Config Transport Interface Anchoring
- `ConfigTransportService` command surface is: `config.persist`, `config.load`, `config.clear`, `config.get_capabilities`.
- Request envelope checks include protocol version, request id, and integrity sentinel.
- Service scope excludes lower-level serial framing/parsing adapter behavior.
- BLE config transport remains deferred in current interface boundary.

## Gap-Tied Interface Focus (VS Program)
- **G-001 / VS-01:** App runtime orchestration boundary must wire USB report path to BLE notify without violating core/adapter separation.
- **G-003 / VS-02:** Serial framing/parser adapter boundary must map losslessly to/from config transport contracts.
- **G-002 / VS-03:** BLE stack callback registration/dispatch boundary must be explicit and recoverable.
- **G-004 / VS-04:** Startup boundary must explicitly initialize storage lifecycle before config operations.
- **G-005 / VS-05:** Test bootstrap boundary must be reproducible in clean environments.
- **G-006 / VS-06:** Runtime web boundary must designate one canonical runtime tree.

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
- No BLE browser-path enablement claims without repo proof.
- No runtime dependence on live GitHub Actions APIs.
- No backend assumptions unless explicitly approved.

## Change Rule
Update this file only when a contract, dependency rule, boundary, invariant, or error category is approved or changed.
