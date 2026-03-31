# IMPLEMENTATION_GAPS.md

## Purpose

Track verified discrepancies between documented intent and current implementation, with code-first evidence.

## 1) Outdated or Incomplete Documentation (Verified)

1. **Build and release instructions need an explicit ESP-IDF version line** so local firmware builds and CI stay aligned.
2. **Historical planning docs include future/complete claims that are not all observable in runtime wiring** (especially around full data-plane completion and operational proof).
3. **Web planning docs describe MVP-era assumptions that diverged from current runtime scripts and command surfaces** (for example, current runtime packaging now uses `web/` as the active path and bundles firmware artifacts).

## 2) Implementation Gaps (Code vs Intended System Behavior)

### G-001 — End-to-end runtime data path is not fully wired in app bootstrap

- `InitializeAndRun()` initializes platform services, starts adapters + supervisor, and activates persisted config.
- It does **not** wire an observed loop from USB report intake through decoder, mapping engine, profile encode, and BLE notify.
- Impact: core modules exist but runtime integration remains partial.

### G-002 — BLE adapter callback/event registration path to real ESP stack is partial

- BLE adapter implements lifecycle backend, status emissions, report-channel state handlers, and recovery.
- Current repository evidence does not show full real-world callback registration/dispatch plumbing from ESP BLE events into these adapter hooks.
- Impact: behavior coverage is good at unit boundary, but full runtime proof remains pending.

### G-003 — Config transport service exists, but transport framing/parsing boundary is external

- `ConfigTransportService` handles command semantics and envelope validation.
- No firmware runtime serial framing/parser endpoint is wired in app bootstrap to feed service requests directly.
- Impact: contract handler logic exists; end-to-end host<->firmware transport runtime is incomplete in this codebase.

### G-004 — Host unit test portability depends on externally installed GTest

- Test CMake uses `find_package(GTest REQUIRED)` without vendored fallback.
- Impact: new environments fail test configuration until GTest is installed.

## 3) Recently Closed Gaps

### Closed — NVS initialization is now orchestrated in app bootstrap

- `InitializeAndRun()` now initializes NVS before attempting persisted-config activation.
- If NVS initialization fails, the app skips persisted-config activation rather than implicitly depending on external startup behavior.

## 4) Suggested Missing Components / Future Work

1. **Runtime pipeline coordinator** that binds:
   - USB listener events -> device registry
   - descriptor semantics -> decode plan
   - report decode -> mapping engine
   - logical state -> profile encode
   - encode result -> BLE notify
2. **Config transport runtime adapter** for serial line protocol parsing/serialization + timeout/error handling.
3. **Hardware-backed integration validation harness** to complement unit tests with serial/BLE proof.
4. **Single-source web runtime strategy** to avoid long-term drift between `web/` and `web-next/`.
5. **Test bootstrap improvements** (bundled/fetched GTest fallback).

## 5) Severity Snapshot

- **High:** G-001, G-003
- **Medium:** G-002
- **Low/Developer Experience:** G-004

## 6) Verification Basis

This document is derived from direct inspection of current source files under `components/`, `main/`, `tests/unit/`, and `web*/` directories.
