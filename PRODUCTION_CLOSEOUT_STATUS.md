# PRODUCTION_CLOSEOUT_STATUS.md

## Audit snapshot
- Branch: `production-closeout-real-usb-ble`
- Date: March 31, 2026
- Method: code + tests + workflow + closeout docs review

## Implementation status (truthful)

### Implemented and test-covered
- Runtime USB->decode/map/profile->BLE dispatch path (`RuntimeDataPlane`).
- Config transport runtime framing/deframing (`@CFG:`) and service wiring in app bootstrap.
- ESP-IDF USB host adapter implementation.
- ESP-IDF BLE transport adapter lifecycle/callback/recovery handling.
- Startup storage lifecycle with explicit NVS init handling.
- Web runtime flash/console/config ownership model and smoke test coverage.
- CI workflow for host unit tests + web smoke tests.

### Proven by CI
- `tests/unit` CMake/CTest suite.
- `web/tests/smoke.spec.js` Playwright smoke suite.

### Not proven by CI (still required)
- Hardware USB matrix behavior (powered hub, multi-device, reconnect fault cases).
- Hardware BLE pairing/reconnect/report stability.
- Full physical operator runbook execution across flash/monitor/config/recovery.

## Current production posture
- **Do not declare production-ready yet.**
- Code and CI readiness are substantially improved.
- Physical validation evidence and final sign-off remain required.

## Required final closeout artifacts
1. Completed `HARDWARE_VALIDATION_PACK.md` evidence rows (not placeholders).
2. Completed release + rollback rehearsal per `RELEASE_ROLLBACK.md`.
3. Signed go/no-go packet with residual risk acceptance.
