# IMPLEMENTATION_GAPS

This file tracks **verified implementation gaps** and **documentation mismatches** using the current codebase as the source of truth.

## Audit Scope

Reviewed areas:

- Firmware entry and app orchestration (`main/`, `components/charm_app/`)
- Core translation/control modules (`components/charm_core/`)
- Platform adapters (`components/charm_platform_*`)
- Host unit tests (`tests/unit/`)
- Runtime web shells (`web/`, `web-next/`)
- Project documentation (`README.md`, `ARCHITECTURE.md`, `INTERFACES.md`, process docs)

---

## 1) Documentation Discrepancies (Verified)

## D-001 — Historical docs overstate runtime completeness

Multiple milestone/process docs describe major tracks as complete while code still shows missing end-to-end runtime pipeline integration and missing firmware config transport I/O adapter.

**Status:** open (documentation language must remain conditional/evidence-based).

## D-002 — Documentation coverage existed but lacked a consolidated code-vs-doc audit artifact

Before this update, architecture/status docs existed, but there was no single structured document summarizing which docs were aligned vs stale and why.

**Status:** addressed by adding `DOCUMENTATION_AUDIT.md`.

---

## 2) Implementation Gaps (Code vs Expected Product Behavior)

## G-001 — End-to-end firmware data path not wired in app bootstrap (**High**)

Observed:

- `InitializeAndRun()` starts adapters/supervisor and activates persisted config.
- No runtime loop wiring from USB report events through decode/mapping/profile encoding and BLE notify.

Impact:

- Core translation modules are implemented, but runtime data-plane behavior is only partial.

## G-002 — BLE adapter callback plumbing to real stack events remains partial (**Medium**)

Observed:

- BLE adapter supports lifecycle, channel-ready/closed hooks, and notify path.
- Repository does not show full event registration/dispatch integration from ESP BLE stack callbacks into those hooks.

Impact:

- Adapter behavior is testable in isolation, but production callback integration evidence is incomplete.

## G-003 — Config transport I/O boundary missing in firmware runtime (**High**)

Observed:

- `ConfigTransportService` implements validated command semantics.
- No serial framing/parser runtime integration in app bootstrap to feed service requests/responses.

Impact:

- Contract-level config operations exist; end-to-end host↔firmware config transport path is incomplete.

## G-004 — NVS initialization lifecycle not shown in startup path (**Medium**)

Observed:

- `ConfigStoreNvs` uses `nvs_open`/read/write/commit/close.
- No explicit `nvs_flash_init` orchestration is present in current app startup code.

Impact:

- Correct behavior depends on external initialization assumptions not shown in this repo’s startup wiring.

## G-005 — Host test portability depends on preinstalled GTest (**Low / DX**)

Observed:

- Unit test CMake uses `find_package(GTest REQUIRED)` with no fallback.

Impact:

- Fresh environments fail configuration unless GTest is installed manually.

## G-006 — Dual web runtime trees increase drift risk (**Low / Maintainability**)

Observed:

- `web/` and `web-next/` both exist with near-parity module structure.

Impact:

- Parallel maintenance can diverge behavior, tests, and operator guidance over time.

---

## 3) Missing Components / Recommended Work

1. **Runtime pipeline coordinator** in firmware app layer:
   - USB listener events -> registry/descriptor model
   - decode -> mapping -> logical state
   - profile encode -> BLE notify
2. **Firmware config transport adapter**:
   - serial framing/parsing
   - command dispatch to `ConfigTransportService`
   - timeouts/retry/error mapping
3. **BLE production integration hardening**:
   - explicit callback registration wiring
   - hardware validation traces and failure injection coverage
4. **Test bootstrap portability improvements**:
   - vendored/fetched GTest fallback
   - CI bootstrap scripts
5. **Web runtime consolidation plan**:
   - define canonical runtime (`web` vs `web-next`)
   - document promotion/deprecation flow

---

## 4) Priority Snapshot

- **High:** G-001, G-003
- **Medium:** G-002, G-004
- **Low:** G-005, G-006

---

## 5) Exit Criteria (When to Close Each Gap)

- **G-001:** app runtime demonstrates USB input → BLE output flow with tests/hardware evidence.
- **G-002:** real stack callback registration path exists and is validated.
- **G-003:** serial transport parser/serializer integrated and exercised end-to-end.
- **G-004:** startup performs explicit NVS init with failure handling.
- **G-005:** tests build in clean environments without manual GTest installation.
- **G-006:** one runtime path is canonical or documented promotion path prevents drift.
