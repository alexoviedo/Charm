# ARCHITECTURE.md

## Status

- State: active
- Scope: code-verified architecture and enforced boundaries
- Source of truth: implementation under `components/`, `main/`, and test coverage under `tests/unit/`

## System Objective

Charm is structured to translate USB HID input semantics into BLE HID gamepad output on ESP32-S3 while preserving strict boundary separation:

- contracts and ports define stable integration points
- core logic is mostly platform-agnostic
- platform adapters isolate ESP-IDF/runtime dependencies
- config persistence and control-plane concerns are separated from translation logic

## Layer Model

1. **Contracts (`components/charm_contracts`)**
   - Shared request/result/status/fault types
   - Transport and identity models
2. **Ports (`components/charm_ports`)**
   - Abstract runtime dependencies: USB host, BLE transport, config store, time
3. **Core (`components/charm_core`)**
   - Registry, decode/model, mapping, logical state, profile, supervisor/recovery
4. **App (`components/charm_app`)**
   - Process bootstrap and config orchestration
5. **Platform (`components/charm_platform_*`)**
   - ESP/runtime-specific adapter implementations

## Implemented Components

### Core

- `InMemoryDeviceRegistry`
- `DefaultHidSemanticModel`
- `DefaultDecodePlanBuilder`
- `DefaultHidDecoder`
- `CanonicalLogicalStateStore`
- `DefaultMappingEngine`
- `CanonicalProfileManager`
- `DefaultSupervisor`
- `DefaultRecoveryPolicy`

### App

- `InitializeAndRun()` startup wiring
- `ActivatePersistedConfig()` boot-time config activation
- `ConfigTransportService` command handler (`persist/load/clear/get_capabilities`)

### Platform

- `UsbHostAdapter`
- `BleTransportAdapter` + backend abstraction
- `ConfigStoreNvs`
- `TimePortEspIdf`

## Data-Path Reality (Current)

Current runtime wiring confirms startup lifecycle and config activation. The full production data pipeline exists in building blocks but is **not fully connected in `InitializeAndRun()`**.

Implemented building blocks:

- HID decode + mapping + logical state + profile encode modules
- BLE notify path boundary

Not yet fully wired in app runtime:

- USB listener-driven decode/mapping/encode/notify loop
- end-to-end runtime dispatch from USB reports to BLE output

## Operational States

- Supervisor mode state: `kUnknown`, `kConfiguration`, `kRun`
- Recovery state: `kNone`, `kRequested`, `kRecovering`
- BLE adapter state machine includes running/stopped status and bounded recovery attempts

## Boundary Rules

- Core modules do not own ESP stack lifecycle details.
- Transport-specific behavior remains in adapters behind port interfaces.
- Config transport command semantics are in app service layer; framing/parsing transport IO is out of scope of current service implementation.
- Persisted config operations are isolated behind `ConfigStorePort`.

## Testability Posture

- Extensive host-side unit coverage exists for core components and several adapters.
- Test harness includes ESP/NVS/time mocks in `components/charm_test_support`.
- Unit test execution currently depends on environment-installed GTest.

## Architectural Gaps / Deferred Integration

See `IMPLEMENTATION_GAPS.md` for tracked discrepancies and priority.

## Change Policy

Update this file when implementation-level architecture changes (component boundaries, runtime orchestration paths, or ownership contracts).
