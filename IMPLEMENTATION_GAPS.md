# IMPLEMENTATION_GAPS

This file tracks **verified implementation gaps** and **documentation mismatches** using the current codebase as the source of truth.

## Audit Scope

Reviewed areas:

- Firmware entry and app orchestration (`main/`, `components/charm_app/`)
- Core translation/control modules (`components/charm_core/`)
- Platform adapters (`components/charm_platform_*`)
- Host unit tests (`tests/unit/`)
- Runtime web shell (`web/`)
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

## G-001 — End-to-end firmware data path wiring in app bootstrap (**High**)

Observed:

- VS-01 added app-layer runtime orchestration (`RuntimeDataPlane`) wiring USB callbacks through descriptor/plan handling, decode, mapping application, profile encode, and BLE notify.
- Host-side unit evidence (`RuntimeDataPlaneTest`) is passing locally.

Impact:

- **Status: closed by VS-01 implementation/evidence closure.**

## G-002 — BLE adapter callback plumbing to real stack events (**Medium**)

Observed:

- VS-03 added stack callback registration in the BLE backend and routes GAP/GATTS callback events into adapter lifecycle and report-channel handlers.
- Host-side `BleTransportAdapterTest` now includes callback-driven ordering and bounded-recovery coverage.

Impact:

- **Status: closed by VS-03 implementation/evidence closure.**

## G-003 — Config transport I/O boundary in firmware runtime (**High**)

Observed:

- VS-02 added `ConfigTransportRuntimeAdapter` implementing serial-first newline framing, request parsing, service dispatch, and response serialization.
- Host-side `ConfigTransportRuntimeAdapterTest` evidence is passing locally.

Impact:

- **Status: closed by VS-02 implementation/evidence closure.**

## G-004 — NVS initialization lifecycle not shown in startup path (**Medium**)

Observed:

- VS-04 added explicit startup storage initialization (`nvs_flash_init`) with bounded recoverable handling (erase + reinit) before config activation.
- Startup now fail-closes and records a persistence fault when initialization cannot complete.

Impact:

- **Status: closed by VS-04 implementation/evidence closure.**

## G-005 — Host test portability depends on preinstalled GTest (**Low / DX**)

Observed:

- VS-05 updated unit-test bootstrap to prefer system GTest but fall back to a repo-local FetchContent path when absent.
- Clean-environment configuration/build evidence was executed with `CMAKE_DISABLE_FIND_PACKAGE_GTest=ON`.

Impact:

- **Status: closed by VS-05 implementation/evidence closure.**

## G-006 — Dual web runtime trees increase drift risk (**Low / Maintainability**)

Observed:

- VS-06 consolidated runtime web to one canonical tree (`web/`) and removed non-canonical `web-next/`.

Impact:

- **Status: closed by VS-06 implementation/evidence closure.**

---

## 3) Missing Components / Recommended Work

1. **BLE production integration hardening**:
   - explicit callback registration wiring
   - hardware validation traces and failure injection coverage
2. **Test bootstrap portability improvements**:
   - vendored/fetched GTest fallback
   - CI bootstrap scripts
3. **Web runtime drift prevention (post-consolidation)**:
   - keep `web/` as the single runtime source of truth
   - reject introducing parallel runtime trees without explicit governance

---

## 4) Priority Snapshot

- **High:** none
- **Medium:** none
- **Low:** none

---

## 5) Exit Criteria (When to Close Each Gap)

- **G-001:** closed (VS-01): app runtime demonstrates USB input → BLE output flow with host-test evidence; additional hardware evidence is tracked in VS-07.
- **G-002:** closed (VS-03): real stack callback registration/dispatch path exists with host evidence; remaining hardware-attached validation is tracked in VS-07.
- **G-003:** closed (VS-02): serial parser/serializer adapter integrated with host evidence; remaining hardware-attached evidence is tracked in VS-07.
- **G-004:** closed (VS-04): startup performs explicit NVS init with bounded failure handling and fail-closed activation gating.
- **G-005:** closed (VS-05): tests configure/build with system-or-fetched GTest without manual preinstall.
- **G-006:** closed (VS-06): one canonical runtime path (`web/`) remains and ambiguity from parallel trees is removed.
