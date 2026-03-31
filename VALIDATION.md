# VALIDATION.md

## Purpose
Define what this repository can prove automatically vs what must be validated on physical hardware.

## Automated Validation (CI-proved)

### Firmware/Core host-side
- Configure/build/run all `tests/unit` targets via CMake + CTest.
- Coverage includes core logic, runtime data-plane behavior, config transport service/runtime adapter framing, USB adapter simulation hooks, BLE adapter state/recovery behaviors, and startup storage lifecycle.

### Web runtime
- Playwright smoke suite in `web/tests/smoke.spec.js`.
- Covers shell rendering, capability gating, config panel guards, flasher identify/flash happy path with mocked `esptool-js`, and ownership-blocking behavior.

## Manual Validation (Hardware-required)
CI **cannot** prove these:
- Real USB host enumeration/report behavior on target hardware.
- Real BLE connect/disconnect/report-channel behavior and recovery under stress.
- Real flashing/monitor/config operator flows with physical board and serial transport.

These must be executed with evidence capture per `HARDWARE_VALIDATION_PACK.md`.

## Acceptance rules
- Do not declare production-ready without:
  1. Green automated checks (unit + web smoke), and
  2. Completed hardware scenario matrix with captured evidence and pass/fail results.
- Distinguish clearly between:
  - **Code implemented**
  - **CI verified**
  - **Hardware validated**

## Clean-environment commands

```bash
cmake -S tests/unit -B build/unit
cmake --build build/unit --parallel
ctest --test-dir build/unit --output-on-failure

npm --prefix web ci
npx --prefix web playwright install --with-deps chromium
npm --prefix web run qa:smoke
```
