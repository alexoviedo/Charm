# IMPLEMENTATION_GAPS.md

This file tracks **current real gaps** (code gap vs validation/evidence gap).

## Closed implementation gaps

| ID | Gap | Current state |
|---|---|---|
| G-001 | Runtime data-plane not wired | **Closed in code**: runtime path wired and unit-tested |
| G-002 | BLE callback plumbing partial | **Closed in code**: callback/recovery logic implemented and unit-tested |
| G-003 | Config transport runtime I/O missing | **Closed in code**: app runtime adapter + `@CFG:` framing implemented |
| G-004 | Startup NVS lifecycle unclear | **Closed in code**: startup storage lifecycle includes explicit init handling |
| G-005 | Unit bootstrap portability weak | **Closed in code/CI**: GTest fallback + CI unit workflow |
| G-006 | Dual runtime tree drift | **Closed**: canonical runtime is `web/` (no `web-next/` active tree) |
| G-007 | USB host adapter simulation-only | **Closed in code**: ESP-IDF HID host adapter path exists |

## Remaining open gaps (not code-complete, evidence-complete)

### E-001 Hardware USB validation evidence missing (**Critical**)
- Need powered-hub + multi-device + disconnect/reconnect matrix execution on target hardware.

### E-002 Hardware BLE validation evidence missing (**Critical**)
- Need connect/disconnect/recovery/report reliability evidence from real BLE peers.

### E-003 End-to-end operator-flow evidence missing (**High**)
- Need real flash/monitor/config ownership flow evidence on physical boards.

### E-004 Final go/no-go sign-off packet missing (**High**)
- Need signed production gate packet linking evidence artifacts and residual-risk acceptance.

## Exit criteria for this file to be fully clear
- Each open evidence gap has `CAPTURED` evidence references in `HARDWARE_VALIDATION_PACK.md`.
- `PRODUCTION_CLOSEOUT_STATUS.md` can move from “not yet proven” to “ready” only when E-001..E-004 are closed.
