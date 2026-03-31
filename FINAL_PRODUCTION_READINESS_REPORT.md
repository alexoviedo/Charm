# FINAL_PRODUCTION_READINESS_REPORT.md

Date: 2026-03-31  
Branch: `work`

## Executive recommendation
**Recommendation: NO-GO for production launch at this moment.**

Reason: software implementation and automation are strong, but mandatory physical hardware evidence (USB hub multi-device + BLE runtime/recovery + end-to-end operator execution) is still required and cannot be proven from repository access alone.

---

## 1) Implemented capabilities (code present)

### Firmware runtime path
- USB host listener -> runtime decode/mapping/profile encode -> BLE notify pipeline is implemented in app/runtime modules.
- Config transport runtime adapter is integrated with serial `@CFG:` framing.
- Startup storage lifecycle includes explicit initialization path.

### Platform adapters
- ESP-IDF-backed USB host adapter path is implemented.
- ESP-IDF-backed BLE transport lifecycle/callback/report path is implemented with recovery semantics.

### Web runtime
- Static runtime app supports flash, console monitor, config transport operations, and serial ownership gating.
- Flash path uses vendored `esptool-js` module and in-repo MD5 implementation.

### CI/workflows
- Dedicated CI workflow runs unit + web smoke checks.
- Release workflow now includes preflight automated tests before firmware build/package/deploy.

---

## 2) Remaining limitations / blockers

1. **Hardware proof missing for USB host matrix**
   - Powered-hub + multi-device behavior requires physical execution evidence.
2. **Hardware proof missing for BLE runtime stability**
   - Connect/disconnect/recovery/report-channel behavior requires physical evidence.
3. **Hardware proof missing for full operator flow**
   - Real-board flash/monitor/config handoff needs captured session evidence.
4. **Final sign-off packet pending**
   - Go/no-go authority + explicit residual-risk acceptance artifact is not yet present.

---

## 3) What was validated in automation

### Host/unit automation
Command set:
```bash
cmake -S tests/unit -B /tmp/charm-unit-build
cmake --build /tmp/charm-unit-build -j4
ctest --test-dir /tmp/charm-unit-build --output-on-failure
```
Result: pass.

### Web smoke automation
Command set:
```bash
cd web
npx playwright install --with-deps chromium
npm run qa:smoke
```
Result: pass.

### Regression coverage tightened in this closeout
- USB adapter event dispatch/drop behaviors (simulation hooks).
- Runtime data-plane unknown-interface negative path.
- Config runtime adapter mixed log/control stream filtering.
- Web config ownership guard behavior.

---

## 4) What still requires physical hardware execution

Mandatory physical scenarios:
- FL-01/FL-02 flash success and failure-recovery on real board.
- MON-01 console connect/disconnect/log stream validation.
- CFG-01/CFG-02 real config command round-trips and ownership guard behavior.
- USB-01/USB-02 single and powered-hub multi-device USB host behavior.
- BLE-01/BLE-02 BLE report channel readiness, disconnect/reconnect recovery.
- STG-01 cold boot storage initialization behavior.
- REL-01/REL-02 artifact verification and rollback rehearsal.

Reference pack: `HARDWARE_VALIDATION_PACK.md`.

---

## 5) Exact hardware validation steps

1. Prepare candidate firmware + web artifacts and verify checksums.
2. Execute scenario matrix in `HARDWARE_VALIDATION_PACK.md`.
3. For each scenario capture:
   - `commands.txt`
   - `serial.log`
   - `ui-status.txt`
   - `result.json`
4. Store under `evidence/<YYYYMMDD>/<scenario-id>/`.
5. Mark PASS/FAIL and attach evidence links in gate review notes.

---

## 6) Exact release steps

1. Run automation preflight:
```bash
cmake -S tests/unit -B build/unit
cmake --build build/unit --parallel
ctest --test-dir build/unit --output-on-failure
npm --prefix web ci
npx --prefix web playwright install --with-deps chromium
npm --prefix web run qa:smoke
```
2. Verify firmware artifact integrity:
```bash
cd <firmware_artifact_dir>
sha256sum -c SHA256SUMS
cat provenance.json
```
3. Verify runtime web artifact integrity:
```bash
cd <web_artifact_dir>
sha256sum -c SHA256SUMS
cat provenance.json
```
4. Ensure mandatory hardware scenarios are PASS with captured evidence.
5. Produce release packet with commit SHA, workflow run IDs, evidence links, and sign-off decision.

---

## 7) Exact rollback steps

### Web rollback
1. Choose prior known-good release id/commit.
2. Redeploy that snapshot.
3. Re-run web smoke + sanity checks.

### Firmware rollback
1. Retrieve known-good firmware artifact set.
2. Verify `SHA256SUMS` + `provenance.json`.
3. Flash rollback artifact via normal flash path.
4. Verify baseline monitor + config behavior.

Known-safe fallback: revert to previous known-good firmware/web pair and block candidate promotion.

---

## 8) Final go/no-go decision statement

**Current decision: NO-GO (pending physical evidence closure).**

Ship can be reconsidered only after:
- mandatory hardware matrix is fully PASS with evidence,
- rollback rehearsal is PASS,
- sign-off packet is completed by designated owners.
