# Charm

Charm is an ESP32-S3 project that translates USB HID controller input into BLE HID gamepad output, with a static web runtime for artifact flashing, monitoring, and serial-first configuration transport operations.

## Current State (Code-First)

**As of March 30, 2026:**

- The repository has substantial firmware/web infrastructure and a complete control-history trail.
- Core modules and platform adapters exist, but verified implementation gaps remain open and are tracked in `IMPLEMENTATION_GAPS.md`.
- The active execution posture is now the **vertical-slice program** (`VS-01`..`VS-08`) focused on closing verified gaps G-001..G-006 in a narrow, testable sequence.
- Runtime web shell remains active at `web/`; `web-next/` still exists and is treated as a drift risk until consolidation.

## Active Program

The authoritative active program is documented in:
- [`CURRENT_TASK.md`](./CURRENT_TASK.md)
- [`TODO.md`](./TODO.md)
- [`IMPLEMENTATION_SLICES.md`](./IMPLEMENTATION_SLICES.md)
- [`PRODUCTION_VERTICAL_SLICES.md`](./PRODUCTION_VERTICAL_SLICES.md)

### Vertical Slice Sequence
1. VS-01 Runtime Data Plane Integration (G-001)
2. VS-02 Firmware Config Transport Adapter (G-003)
3. VS-03 BLE Stack Callback Wiring Hardening (G-002)
4. VS-04 Startup Storage Lifecycle Hardening (G-004)
5. VS-05 Test Bootstrap Portability (G-005)
6. VS-06 Web Runtime Consolidation (G-006)
7. VS-07 End-to-End Hardware Validation Pack
8. VS-08 Release, Rollback, and Production Gate Closure

## Architecture Overview

- `main/` firmware entrypoint
- `components/charm_contracts/` shared contract types
- `components/charm_ports/` boundary interfaces
- `components/charm_core/` platform-agnostic core logic
- `components/charm_app/` app bootstrap + config service semantics
- `components/charm_platform_*` platform adapters (USB/BLE/storage/time)
- `web/` active runtime web shell

## Development Rules

- Code is the source of truth.
- One narrow slice at a time.
- Preserve ports/adapters boundaries and deterministic core behavior.
- Keep serial-first config transport and zero-backend web posture unless explicitly re-decided.
- Keep control Markdown files truthful and current at every slice boundary.

## Known Gaps

See [`IMPLEMENTATION_GAPS.md`](./IMPLEMENTATION_GAPS.md) for authoritative gap tracking (G-001..G-006).

## Historical Programs

- WR restart-track history and prior production-tracking history are preserved in control docs.
- They are retained for auditability and must not be erased.

## Additional Documentation

- [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- [`INTERFACES.md`](./INTERFACES.md)
- [`VALIDATION.md`](./VALIDATION.md)
- [`IMPLEMENTATION_GAPS.md`](./IMPLEMENTATION_GAPS.md)
- [`IMPLEMENTATION_SLICES.md`](./IMPLEMENTATION_SLICES.md)
- [`PRODUCTION_VERTICAL_SLICES.md`](./PRODUCTION_VERTICAL_SLICES.md)
- [`VS_01_RUNTIME_DATA_PLANE_READINESS.md`](./VS_01_RUNTIME_DATA_PLANE_READINESS.md)
- [`CHANGELOG_AI.md`](./CHANGELOG_AI.md)
