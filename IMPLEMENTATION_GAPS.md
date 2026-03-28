# IMPLEMENTATION_GAPS.md

## Purpose

Track verified discrepancies between documented intent and current implementation, with code-first evidence.

## 1) Outdated or Incomplete Documentation (Verified)

1. **`README.md` was effectively empty** (`# Charm` only), providing no setup, architecture, or status guidance.
2. **Historical planning docs include future/complete claims that are not all observable in runtime wiring** (especially around full data-plane completion and operational proof).
3. **Web planning docs describe MVP-era assumptions that diverged from current runtime scripts and command surfaces** (e.g., now includes config draft and config transport oriented operations in `web/`).

## 2) Implementation Gaps (Code vs Intended System Behavior)

### G-001 — End-to-end runtime data path is not fully wired in app bootstrap

- `InitializeAndRun()` starts adapters + supervisor and activates persisted config.
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

### G-004 — NVS initialization lifecycle is assumed, not orchestrated in app bootstrap

- `ConfigStoreNvs` reads/writes with NVS open/commit/close, but app bootstrap has no explicit NVS init step.
- Impact: depends on external environment/bootstrap behavior not shown in current app code.

### G-005 — Host unit test portability depends on externally installed GTest

- Test CMake uses `find_package(GTest REQUIRED)` without vendored fallback.
- Impact: new environments fail test configuration until GTest is installed.

## 3) Suggested Missing Components / Future Work

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

## 4) Severity Snapshot

- **High:** G-001, G-003
- **Medium:** G-002, G-004
- **Low/Developer Experience:** G-005

## 5) Verification Basis

This document is derived from direct inspection of current source files under `components/`, `main/`, `tests/unit/`, and `web*/` directories.
