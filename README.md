# Charm

Charm is an ESP32-S3 firmware + static web runtime that delivers:
- USB HID input ingestion on device
- runtime decode/map/profile pipeline
- BLE HID report output
- serial-framed config transport (`@CFG:`)
- browser-based flashing/console/config tooling (`web/`)

## Current Truth (March 31, 2026)

What is implemented in this branch:
- Firmware runtime wiring exists from USB host listener to BLE notify via `RuntimeDataPlane`.
- ESP-IDF-backed USB host and BLE adapter implementations are present in platform adapters.
- Startup storage lifecycle includes explicit NVS initialization handling.
- Config transport runtime adapter is integrated in app bootstrap and uses `@CFG:` line framing to coexist with normal logs.
- Web runtime uses local vendored flasher dependency (`esptool-js`) and local MD5 hashing implementation (no runtime CDN dependency for those critical paths).
- Host-side unit tests and Playwright smoke tests are both in CI.

What is still not proven by CI:
- Physical USB hardware behavior on target hub/device matrix.
- Physical BLE pairing/reconnect/runtime stability under sustained load.
- End-to-end flashing/monitor/config interaction against real boards in operator workflows.

## Repo Entry Points

- Firmware app/runtime: `components/charm_app/`
- USB adapter: `components/charm_platform_usb/`
- BLE adapter: `components/charm_platform_ble/`
- Unit tests: `tests/unit/`
- Web runtime: `web/`
- CI workflows: `.github/workflows/`

## Validation + Release Documents

- Hardware execution pack: `HARDWARE_VALIDATION_PACK.md`
- Validation policy and evidence boundaries: `VALIDATION.md`
- Release and rollback instructions: `RELEASE_ROLLBACK.md`
- Current closeout truth: `PRODUCTION_CLOSEOUT_STATUS.md`

## Quick test commands

```bash
cmake -S tests/unit -B build/unit
cmake --build build/unit --parallel
ctest --test-dir build/unit --output-on-failure

npm --prefix web ci
npx --prefix web playwright install --with-deps chromium
npm --prefix web run qa:smoke
```
