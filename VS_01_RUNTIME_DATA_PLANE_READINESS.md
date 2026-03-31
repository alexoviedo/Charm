# VS-01 Runtime Data Plane Integration — Implementation Readiness Plan

## Slice
- ID: VS-01
- Gap target: G-001
- Status: readiness complete (implementation not started)

## Objective
Wire the runtime data path in firmware app orchestration:
USB input -> descriptor/plan handling -> decode -> mapping -> profile encode -> BLE notify

No runtime code changes are included in this planning artifact.

## Code-Verified Current State
- `InitializeAndRun()` currently starts USB/BLE/supervisor and applies persisted config; no runtime report pipeline is wired.
- USB adapter already exposes listener callbacks for device/interface/report/status events.
- Core modules exist for registry, descriptor parse, decode-plan build, decode, mapping, logical state, and profile encode.
- BLE adapter already exposes `NotifyInputReport` and status/listener interfaces.

## Proposed Event/Data Flow (Implementation Target)
1. **Boot wiring (app layer):**
   - Initialize runtime coordinator and set it as `UsbHostPortListener` (and optional `BleTransportPortListener` for status coupling).
   - Start adapters and supervisor in deterministic order.
2. **On device connected:**
   - Register device in `DeviceRegistry`.
3. **On interface descriptor available:**
   - Claim interface via `UsbHostPort::ClaimInterface`.
   - Register interface in `DeviceRegistry`.
   - Parse HID descriptor -> semantic model.
   - Build decode plan from semantic model.
   - Attach decode plan to registry entry.
4. **On report received:**
   - Lookup decode plan by `interface_handle`.
   - Decode raw report -> input events.
   - For each decoded event:
     - Apply mapping via `MappingEngine` using active bundle from `Supervisor` state.
   - Read logical state.
   - Encode logical state using active profile from `Supervisor` state.
   - Notify BLE transport with encoded report.
5. **On failures:**
   - Fail-safe path: do not emit partial/undefined report output.
   - Surface fault/status and keep deterministic behavior.

## Boundary Placement
### Wiring belongs in
- `components/charm_app/` (runtime orchestration only).

### Wiring explicitly does NOT belong in
- `components/charm_core/` (must stay platform-agnostic, no adapter/lifecycle ownership).
- `components/charm_platform_usb/` and `components/charm_platform_ble/` (no cross-domain orchestration logic).
- `web/` runtime (no firmware pipeline ownership).

## Exact Files Planned for Future Implementation Step
1. `components/charm_app/include/charm/app/runtime_data_plane.hpp` (new)
   - Define coordinator class implementing `UsbHostPortListener` and orchestrating pipeline steps.
2. `components/charm_app/src/runtime_data_plane.cpp` (new)
   - Implement listener callbacks + deterministic pipeline dispatch + fault handling.
3. `components/charm_app/src/app_bootstrap.cpp`
   - Construct coordinator and wire listeners; start sequence remains app-owned.
4. `components/charm_app/CMakeLists.txt`
   - Add new runtime coordinator source to build.
5. `tests/unit/test_runtime_data_plane.cpp` (new)
   - Host tests for happy path, malformed report rejection, missing plan handling, and BLE unavailable cases.
6. `tests/unit/CMakeLists.txt`
   - Register new VS-01 unit test target/source.

## Assumptions
- Descriptor parse + decode-plan build can be driven from interface-descriptor callback context.
- `Supervisor` active mapping/profile state is authoritative for runtime application/encoding.
- BLE transport `NotifyInputReport` is the output boundary for this slice.

## Blockers (must be tracked)
- `DeviceRegistry` currently has no direct lookup API for interface/decode-plan retrieval by `InterfaceHandle`; implementation may need a minimal registry query helper.
- `DecodePlanBuilder` currently fills `ElementKey` vendor/product/hub path with defaults (0); mapping hit-rate depends on mapping bundle expectations and may require follow-up constraints.
- `nvs_flash_init` startup lifecycle remains out-of-scope for VS-01 (covered by VS-04), so persistence behavior assumptions remain external during this slice.

## Risks
- Hidden coupling risk if orchestration leaks into adapters/core.
- Event burst risk if callback path becomes unbounded; implementation must keep per-report work bounded.
- Fault spam risk if repeated decode/notify failures are not deduplicated or categorized.

## Non-goals (VS-01)
- Serial config transport framing/parsing (VS-02).
- BLE callback registration hardening work (VS-03).
- Startup NVS lifecycle hardening (VS-04).
- Test portability/bootstrap dependency work (VS-05).
- Web runtime consolidation (VS-06).

## Acceptance and Validation Plan

### Automated (unit/integration-style on host)
1. **Happy path deterministic flow**
   - Simulate interface-ready + report-received sequence.
   - Verify decode -> map -> encode -> notify ordering and success statuses.
2. **Malformed/unsupported input**
   - Empty report / length mismatch / missing decode plan / unmapped events.
   - Verify no BLE notify call and deterministic rejected/fault outcome.
3. **Bounded recovery/failure behavior at slice boundary**
   - BLE unavailable/failure from `NotifyInputReport`.
   - Verify fail-safe behavior and deterministic status surfacing without undefined state mutation.

### Manual/integration evidence
- Hardware trace for USB input resulting in BLE notify output (at least one representative device profile).
- Negative-path trace showing rejected malformed input with no unsafe output.
- Capture evidence IDs in validation artifacts tied to firmware build identity.

## Exit Evidence Checklist
- [ ] Runtime wiring exists in app layer only.
- [ ] Unit tests for happy and negative paths pass.
- [ ] Manual/integration evidence recorded for at least one hardware path.
- [ ] New blockers (if any) logged in control docs.
