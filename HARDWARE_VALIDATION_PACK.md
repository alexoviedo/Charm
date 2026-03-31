# HARDWARE_VALIDATION_PACK.md

## Purpose
Concrete execution pack for physical validation that CI cannot prove.

## Evidence root
Store all artifacts under:
`evidence/<YYYYMMDD>/<scenario-id>/`

Each scenario must include:
- `commands.txt` (exact commands executed)
- `serial.log` (raw monitor output)
- `ui-status.txt` (copied status text from web panels)
- `result.json` (`PASS`/`FAIL` + notes)

## Hardware matrix
- HW-A: primary ESP32-S3 board + USB cable
- HW-B: second ESP32-S3 board (rollback/regression lane)
- HW-C: BLE peer device (phone or host BLE tool)
- HUB-1: powered USB hub for multi-device tests

## Scenario matrix

| ID | Scenario | Required | Pass criteria |
|---|---|---|---|
| FL-01 | Flash clean board from web UI | Yes | Identify + flash complete, no `FLASH_FAILED`, device reboots |
| FL-02 | Flash retry after induced failure (disconnect mid-flash) | Yes | Failure is explicit, recovery flow succeeds on retry |
| MON-01 | Console connect/disconnect | Yes | Monitor connects, streams logs, clean disconnect |
| CFG-01 | `config.get_capabilities` roundtrip | Yes | Response is `@CFG:` framed and `status=kOk` |
| CFG-02 | `config.load` / `config.persist` / `config.clear` | Yes | Expected status + data; blocked states enforced when owner wrong |
| OWN-01 | Flash/console/config ownership handoff | Yes | Guardrails block invalid transitions; valid transitions succeed |
| USB-01 | USB host enumeration with one HID device | Yes | Device/interface/report events appear and path reaches BLE notify readiness logs |
| USB-02 | USB host with powered hub + 2 devices | Yes | Deterministic behavior under dual devices, no crash/fault loop |
| BLE-01 | BLE connect + report channel ready + notify | Yes | Notify path operational with stable connection |
| BLE-02 | BLE disconnect/reconnect recovery | Yes | Recover or fail-closed deterministically; no runaway loop |
| STG-01 | Cold boot storage init path | Yes | Startup logs show storage init success path |
| REL-01 | Candidate artifact checksum/provenance verification | Yes | `sha256sum -c` passes; provenance fields present |
| REL-02 | Rollback rehearsal on HW-B | Yes | Prior known-good release restored and verified |

## Commands

### Build + artifacts
```bash
idf.py set-target esp32s3
idf.py build
```

### Unit/smoke pre-check before hardware run
```bash
cmake -S tests/unit -B build/unit
cmake --build build/unit --parallel
ctest --test-dir build/unit --output-on-failure
npm --prefix web ci
npx --prefix web playwright install --with-deps chromium
npm --prefix web run qa:smoke
```

### Integrity verification
```bash
cd <artifact_dir>
sha256sum -c SHA256SUMS
cat provenance.json
```

### Serial capture example
```bash
python -m serial.tools.miniterm /dev/ttyUSB0 115200 | tee evidence/<date>/<scenario>/serial.log
```

## Expected log anchors
- Config frames: lines beginning with `@CFG:`
- Flash success path: `FLASH_DONE`
- Ownership block examples: `FLASH_BLOCKED`, `CONFIG_DEVICE_BLOCKED`
- BLE lifecycle/recovery events from firmware logs (adapter status transitions)

## Result recording template
```json
{
  "scenario": "USB-02",
  "date_utc": "2026-03-31T00:00:00Z",
  "result": "PASS",
  "hardware": ["HW-A", "HUB-1"],
  "firmware_commit": "<sha>",
  "web_commit": "<sha>",
  "notes": "short factual summary",
  "evidence": [
    "commands.txt",
    "serial.log",
    "ui-status.txt"
  ]
}
```

## Stop-ship conditions
- Any FAIL in FL/CFG/USB/BLE mandatory scenarios.
- Missing evidence artifacts for mandatory scenarios.
- Integrity verification failure.
