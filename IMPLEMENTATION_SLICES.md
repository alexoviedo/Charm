# IMPLEMENTATION_SLICES.md

## Purpose
Break approved architecture and product constraints into the smallest safe slices.

## Restart Policy
- Legacy web runtime under `web/` is disposable and superseded for planning.
- Replacement implementation was built in parallel path `web-next/`, then cut over in WR-014 to active runtime `web/`.
- Firmware paths are out-of-bounds for WR slices.

## WR Slice Catalog (Restart-Oriented)

### WR-001 — Webapp restart control reset
- Objective:
  - Reset repo control truth for clean replacement webapp restart.
- Status:
  - done
- Validation level:
  - V0 + WR0

### WR-002 — Artifact contract and source decision
- Objective:
  - Lock replacement-web firmware artifact ingestion contract before flasher rebuild.
- Status:
  - done
- Decisions locked in this slice:
  - accepted source modes: `same_site_manifest`, `manual_local_import`
  - live GitHub Actions API runtime dependency: disallowed
  - minimum artifact set: `manifest.json`, `bootloader.bin`, `partition-table.bin`, `charm.bin`
  - flash offsets accepted as legacy contract for now: `0x0000`, `0x8000`, `0x10000`
- Validation level:
  - V0 + V1 + WR0 + WR1

### WR-003 — Parallel replacement shell foundation
- Objective:
  - Create a production-oriented static shell in `web-next/` with required information architecture sections.
- Status:
  - done
- Delivered in this slice:
  - New dark-theme shell in parallel path (`web-next/`) (historical pre-cutover staging path).
  - Required shell sections established: Flash, Console, Config, Validate, Help/Troubleshooting.
  - No real device flows implemented (serial/flashing/config transport/gamepad polling deferred).
- Validation level:
  - V0 + V1 + WR0

### WR-004 — Capability detection and support gating
- Objective:
  - Add capability detection and environment support gating before device-flow implementation.
- Status:
  - done
- Delivered in this slice:
  - secure-context detection
  - Web Serial support detection
  - Gamepad API support detection
  - unsupported-browser UX and insecure-context UX distinction
  - denied/unsupported messaging architecture
  - capability-based action disabling without breaking shell navigation
- Validation level:
  - V1 + WR0

### WR-005 — Artifact ingestion baseline
- Objective:
  - Implement artifact ingestion layer without adding flashing/serial flows.
- Status:
  - done
- Delivered in this slice:
  - same-site published manifest mode
  - manual local artifact import mode
  - artifact set validation for `manifest.json`, `bootloader.bin`, `partition-table.bin`, `charm.bin`
  - clear error surfacing for missing/incomplete artifacts
  - artifact-source state isolated from serial/flashing state
  - no live GitHub Actions API dependency
- Validation level:
  - V1 + WR0 + WR1

### WR-006 — Serial ownership and permission model
- Objective:
  - Establish one-owner serial resource arbitration and permission state model before flash/console implementations.
- Status:
  - done
- Delivered in this slice:
  - exactly-one-owner serial model (`none`, `flash`, `console`)
  - explicit permission states: request, granted, denied, cancelled, busy, unsupported
  - feature-agnostic owner claim/release foundation
  - UI messaging for flash/console non-sharing constraint
- Validation level:
  - V1 + WR0

### WR-007 — Web flasher baseline
- Objective:
  - Rebuild flasher path on top of approved artifact ingestion and serial ownership models.
- Status:
  - done
- Delivered in this slice:
  - explicit user-action port request path
  - identify target chip via flashing path
  - flash approved artifact set with deterministic progress/failure states
  - clean serial ownership release after flash/reset flow
  - flash mode remains separate from console mode
- Validation level:
  - V1 + WR0 + WR1


### WR-008 — Serial monitor baseline (serial-owner aware)
- Objective:
  - Implement serial monitor baseline using shared serial ownership without coupling to flash flow.
- Status:
  - done
- Delivered in this slice:
  - independent monitor connect flow
  - independent monitor disconnect flow
  - clear output and auto-scroll controls
  - explicit unplug/disconnect/read-failure handling
  - ownership coordination that prevents monitor/flasher contention
- Validation level:
  - V1 + WR0

### WR-009 — Flash/console session lifecycle hardening
- Objective:
  - Refine session-level transitions and conflict/recovery paths between flash and console ownership handoff.
- Status:
  - done
- Validation level:
  - V1 + WR0

### WR-010 — Configuration information architecture and local draft model
- Objective:
  - Create a production-oriented local-only config authoring surface and draft data model, without device transport/write/persist behavior.
- Status:
  - done
- Guardrail:
  - Device write/persist must use the approved repo-proven config transport contract.
- Validation level:
  - V1 + WR0

### WR-011 — Config validation plus import/export
- Objective:
  - Implement config transport integration for validate/import/export flows using the approved repo-proven contract, with deterministic error handling.
- Status:
  - done
- Validation level:
  - V1 + WR2

### WR-012 — Device config transport assessment
- Objective:
  - Determine whether browser-to-device config write/persist is implementable under current repo constraints.
- Status:
  - done
- Determination:
  - No proven serial-based config protocol path in repo.
  - No proven non-HID BLE config path in repo.
  - Device config upload/persist remains blocked (`blocked_unproven_transport`).
- Validation level:
  - V1 + WR2

### WR-013 — Validation dashboard and Gamepad API tester
- Objective:
  - Implement a browser-side validation dashboard using Gamepad API as the primary tester path with useful no-controller troubleshooting guidance.
- Status:
  - done
- Delivered:
  - validation dashboard structure
  - reconnect/reboot guidance
  - real-time button visualization
  - real-time axis visualization
  - neutral/calibration-oriented readouts
  - troubleshooting flow when no controller is visible
- Validation level:
  - V1 + WR0

### WR-014 — Cutover and legacy web removal
- Objective:
  - Replace legacy runtime `web/` with validated replacement implementation and retire legacy web runtime state.
- Status:
  - done
- Delivered:
  - legacy runtime `web/` implementation removed
  - validated replacement web implementation installed at final runtime `web/`
  - control files updated to reflect cutover completion and active runtime truth
- Validation level:
  - V1 + WR0

### WR-015 — Config transport proof plan
- Objective:
  - Define the minimum repo evidence and acceptance tests required to prove a host/device config transport path before any runtime write/persist implementation.
- Status:
  - blocked
- Block reason:
  - Missing proven serial protocol and missing proven non-HID BLE transport path.
- Validation level:
  - V0 + V1 + WR2

## Ranked Execution Order
| Order | Slice | Status | Notes |
|---|---|---|---|
| 1 | WR-001 | done | Control truth reset |
| 2 | WR-002 | done | Artifact contract locked |
| 3 | WR-003 | done | Parallel replacement shell foundation complete |
| 4 | WR-004 | done | Capability detection and support gating complete |
| 5 | WR-005 | done | Artifact ingestion baseline complete |
| 6 | WR-006 | done | Serial ownership and permission model complete |
| 7 | WR-007 | done | Web flasher baseline complete |
| 8 | WR-008 | done | Serial monitor baseline complete |
| 9 | WR-009 | done | Hardening slice completed |
| 10 | WR-010 | done | Local config IA + draft model complete; transport contract now approved |
| 11 | WR-011 | done | Local validation + JSON import/export complete (local/browser only) |
| 12 | WR-012 | done | Assessment complete: runtime config transport unproven; remains blocked |
| 13 | WR-013 | done | Validation dashboard + Gamepad API tester complete |
| 14 | WR-014 | done | Runtime cutover complete (`web-next` replacement is now active `web/`) |
| 15 | WR-015 | blocked | Define proof plan for host/device config transport evidence |

## Legacy Web Plan Status
All legacy web slices `W-*` are superseded by the WR restart catalog.
