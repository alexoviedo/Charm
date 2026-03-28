# Charm

Charm is an ESP32-S3 firmware + static web tooling project for bridging USB HID input devices into a BLE HID gamepad profile, with configuration transport and operational tooling separated behind explicit contracts.

## Current Status

**Milestone state (as of 2026-03-28):**
- Core logic, contract models, and platform adapter boundaries are implemented.
- Unit tests exist for core modules, supervisor/recovery, BLE adapter behavior, USB adapter behavior, and config transport service logic.
- A runtime web shell (`web/`) and a near-parity next shell (`web-next/`) exist for flashing, monitor workflows, artifact loading, and config-draft operations.
- Several production-critical integration paths remain partial/stubbed (see [Known Limitations & Gaps](#known-limitations--gaps)).

## Repository Layout

- `main/` — ESP-IDF app entrypoint (`app_main`) and component wiring.
- `components/charm_contracts/` — shared transport/control/status/identity contracts.
- `components/charm_ports/` — abstract ports for USB host, BLE transport, config store, and time.
- `components/charm_core/` — pure(ish) core domain logic (registry, decode plan, decoder, mapping, profile manager, supervisor, recovery).
- `components/charm_app/` — app-layer orchestration (`InitializeAndRun`, config activation, config transport service).
- `components/charm_platform_*` — ESP/platform adapters for BLE, USB host, NVS storage, and time.
- `components/charm_test_support/` — ESP/NVS/time mocks and fake adapters for unit tests.
- `tests/unit/` — CMake/GTest unit suites.
- `web/` and `web-next/` — static browser UI/runtime scripts for flashing, monitor, config draft, and transport-driven flows.
- `scripts/` — release/runtime packaging helpers.

## Architecture Overview (Implemented)

### 1) Contracts and Ports
Contracts in `charm_contracts` define strongly typed requests, results, status/fault categories, identity types, config transport messages, and registry structures. Ports in `charm_ports` isolate runtime dependencies (USB/BLE/storage/time).

### 2) Core Domain
- **Device registry**: in-memory registration/detach/lookup/plan-attach.
- **HID semantic model + decode plan + HID decoder**: parse model and decode incoming reports into canonical element events.
- **Logical state + mapping engine**: map canonical input events into logical gamepad state.
- **Profile manager + generic encoder**: select profile and encode logical state into output report bytes.
- **Supervisor + recovery policy**: mode/profile/mapping/recovery state transitions.

### 3) App Layer
- `InitializeAndRun` wires static instances and starts USB/BLE/supervisor.
- `ActivatePersistedConfig` loads persisted mapping/profile and applies them to supervisor.
- `ConfigTransportService` handles config `persist/load/clear/get_capabilities` requests over a validated envelope and delegates to `ConfigStorePort`.

### 4) Platform Adapters
- **USB adapter**: lifecycle + listener callbacks + simulation hooks.
- **BLE adapter**: lifecycle backend, report channel readiness, notify path, bounded recovery attempts, session-scoped bonding material.
- **Config store (NVS)**: persist/load/clear config + bonding material cache.
- **Time port**: returns microsecond ticks via `esp_timer_get_time()`.

## Installation & Setup

## Prerequisites

- CMake 3.16+
- C++20 compiler toolchain
- ESP-IDF (for firmware build targets)
- (Optional) GTest installed system-wide for `tests/unit`
- (Optional) Node.js for web QA automation in `web/`

## Firmware (ESP-IDF) Build

From repository root:

```bash
idf.py set-target esp32s3
idf.py build
```

Entrypoint delegates to `charm::app::InitializeAndRun()`.

## Unit Tests (host-side)

```bash
cmake -S tests/unit -B build/tests -DCMAKE_BUILD_TYPE=Release
cmake --build build/tests -j
ctest --test-dir build/tests --output-on-failure
```

> Note: current test CMake expects `find_package(GTest REQUIRED)` to resolve from host environment.

## Web Runtime (static shell)

The runtime shell is in `web/` (and `web-next/`). Serve as static files, then open in a Web Serial capable browser.

Example local serve:

```bash
python3 -m http.server 8080
# open http://localhost:8080/web/
```

For Playwright smoke harness setup (inside `web/`):

```bash
npm ci
npm run qa:smoke
```

## Usage Examples

### Firmware boot and config activation
On startup, the app:
1. Starts USB adapter
2. Starts BLE adapter
3. Starts supervisor
4. Loads persisted mapping/profile from config store and activates them

### Config transport service usage pattern (firmware side)
- Validate envelope fields (`protocol_version`, `request_id`, `integrity`)
- Handle commands:
  - `kPersist`
  - `kLoad`
  - `kClear`
  - `kGetCapabilities`
- Return status/fault and payload as contract response

### Web-side workflow (current)
- Load firmware artifacts (same-site manifest or manual local files)
- Claim serial ownership (flash vs console)
- Perform flash or monitor sessions
- Work with local config draft (validate/import/export/browser storage)
- In `web/`, trigger config transport operations when ownership and session gates are satisfied

## Known Limitations & Gaps

A concise audit is in [`IMPLEMENTATION_GAPS.md`](./IMPLEMENTATION_GAPS.md). Key points:

1. **Main runtime pipeline is not fully connected end-to-end** (USB reports are not yet wired through decode→mapping→profile encode→BLE notify in `InitializeAndRun`).
2. **BLE callback wiring to real stack events is incomplete** (adapter has callback handlers, but no full production callback registration path shown in current repo).
3. **Config transport framing/parsing is not implemented in firmware app runtime** (service exists, but serial protocol IO boundary is outside current implementation).
4. **`ConfigStoreNvs` open/init assumptions are implicit** (startup NVS init and namespace prep not shown in app bootstrap).
5. **Unit tests require external GTest package** (no vendored fallback).

## Roadmap (Implementation-Oriented)

Near-term recommended roadmap based on code state:

1. **Wire full runtime data plane in app bootstrap**
   - USB listener integration
   - descriptor/plan generation and registry attach
   - decode + map + encode + BLE notify loop
2. **Implement concrete config transport IO boundary**
   - serial frame parser/serializer
   - robust request validation and timeouts
   - integration tests with app runtime
3. **Harden BLE production path**
   - real callback registration coverage
   - failure/retry telemetry
   - conformance/soak testing on hardware
4. **Expand test system portability**
   - optional FetchContent GTest fallback
   - CI-friendly host-test bootstrap
5. **Consolidate dual web shells (`web` vs `web-next`)**
   - reduce drift and keep a single production runtime shell or clear promotion flow

## Contributing & Development

1. Keep contracts/ports clean and hardware-agnostic at boundary.
2. Keep core logic deterministic and bounded for hot paths.
3. Add/maintain unit tests for every new core/app adapter behavior change.
4. Keep docs aligned to code; do not mark deferred paths as production-complete.
5. For release/ops/process artifacts, preserve evidence-based status language (`done/blocked/deferred`) and avoid aspirational claims.

Recommended dev loop:

```bash
# firmware edit loop (ESP-IDF)
idf.py build

# unit tests
cmake -S tests/unit -B build/tests
cmake --build build/tests
ctest --test-dir build/tests --output-on-failure
```

## Additional Documentation

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — architecture and boundary model.
- [`INTERFACES.md`](./INTERFACES.md) — interface/contract boundary definitions.
- [`IMPLEMENTATION_GAPS.md`](./IMPLEMENTATION_GAPS.md) — code-vs-doc and implementation gap audit.
- [`TODO.md`](./TODO.md) — slice queue and program priorities.

---

If you are evaluating production readiness, treat the **code and tests** as source of truth and this README as a synchronized interpretation of that current state.
