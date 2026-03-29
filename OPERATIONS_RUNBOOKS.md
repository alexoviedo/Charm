# Production Operations Runbooks (OPS-001)

## 1. Purpose and Scope
This runbook set is for operators/maintainers of this repository’s current production-track surface:
- runtime web shell under `web/` (Flash / Console / Config / Validate)
- firmware artifacts produced by `.github/workflows/firmware_build.yml`
- runtime web deployment produced by `.github/workflows/web_runtime_deploy.yml`
- release integrity/provenance via `scripts/generate_release_integrity.sh`

Use this alongside `MANUAL_ACCEPTANCE_MATRIX.md` for evidence capture.

---

## 2. Release Process Runbook

### 2.1 Firmware artifact release (CI)
1. Trigger or observe `ESP-IDF Firmware Build` workflow.
2. Confirm build target is `esp32s3` and success status in summary.
3. Confirm uploaded artifact `firmware-esp32s3-web-artifacts` contains:
   - `manifest.json`
   - `bootloader.bin`
   - `partition-table.bin`
   - `charm.bin`
   - `SHA256SUMS`
   - `provenance.json`
4. Record run id, commit SHA, and artifact retention location in release notes.

### 2.2 Runtime web release (CI/CD)
1. Trigger `Runtime Web Deploy` workflow (push to `main` or manual dispatch).
2. If manual dispatch, set:
   - `target_environment`: `staging` or `production`
   - optional `release_id` (otherwise defaults to commit SHA)
3. Confirm package job generated:
   - `web/`
   - `releases/<release_id>/`
   - `deploy-metadata.json`
   - `SHA256SUMS`
   - `provenance.json`
4. Confirm deploy job reports a valid Pages URL and release summary.

---

## 3. Deployment Verification Runbook
After every web deploy:
1. Open deployed page and verify top-level shell renders (`Flash`, `Console`, `Config`, `Validate`).
2. Verify environment banner state matches browser context:
   - secure + serial capable → `Supported Environment`
   - missing serial API → `Unsupported Browser`
   - insecure context → `Insecure Context`
3. In `Flash` panel, verify artifact mode selector has:
   - `Same-site published manifest`
   - `Manual local artifact import`
4. In `Config`, verify operator controls exist:
   - `Device: Get Capabilities`
   - `Device: Load Config`
   - `Device: Persist Local Draft`
   - `Device: Clear Config`
5. Capture evidence rows in `MANUAL_ACCEPTANCE_MATRIX.md` (REL-01..REL-04 + relevant UI scenarios).

---

## 4. Rollback Procedure Runbook

### 4.1 Runtime web rollback
1. Identify prior known-good release id from deployment history (`releases/<release_id>/`).
2. Re-run `Runtime Web Deploy` from commit/tag for that release id (or explicitly set `release_id` on manual dispatch if policy allows).
3. Verify new `web/` corresponds to rollback candidate and page URL is healthy.
4. Re-run deployment verification checks (Section 3) and record evidence as `REL-04`.

### 4.2 Firmware rollback
1. Identify prior known-good firmware artifact package.
2. Verify integrity/provenance before flashing (`SHA256SUMS`, `provenance.json`).
3. Flash rollback firmware using `Flash Firmware Bundle` flow.
4. Verify monitor/config baseline behavior post-rollback.

---

## 5. Firmware Flashing Recovery Runbook
Use for failed or interrupted flash sessions.

1. In `Flash` panel, inspect status and ownership states:
   - `Permission state`
   - `Owner state`
2. Ensure serial prerequisites:
   - click `Request Serial Permission`
   - set `Claim Owner: Flash`
   - ensure monitor is disconnected
3. Reset stale state if needed:
   - click `Release Owner`
   - click `Reset Permission Model`
   - reconnect USB device
4. Re-load artifacts and re-run:
   - `Identify Device (Flashing Path)`
   - `Flash Firmware Bundle`
5. If still failing, attach logs/screenshots and escalate as P0 when flashing path is blocked.

---

## 6. Config Transport Recovery Runbook
Use for `Config` panel device command failures (`Get Capabilities`, `Load Config`, `Persist`, `Clear`).

1. Confirm guardrails from UI guidance:
   - serial permission granted
   - owner is `Flash`
   - monitor disconnected
   - flash not in progress
2. Recover session state:
   - return to `Flash` panel and re-assert serial ownership model
   - reconnect cable or reboot device if transport appears stale
3. Retry in safe order:
   - `Device: Get Capabilities`
   - `Device: Load Config`
   - `Validate Draft`
   - `Device: Persist Local Draft` (if needed)
4. If timeout/parse/state errors persist, capture:
   - `cfg-write-status` and `cfg-status`
   - monitor output around failure
   - artifact/build identifiers
5. Open regression with scenario linkage (`CFG-*`, `REC-*`).

---

## 7. BLE Issue Triage Runbook
Use for BLE readiness/connectivity/recovery issues.

1. Reproduce on matrix hardware lane with BLE scope (`HW-C`).
2. Capture serial monitor logs during:
   - boot/advertise phase
   - peer connect/disconnect cycle
   - induced failure/recovery attempt
3. Classify issue:
   - advertising never ready
   - connect succeeds but unstable runtime behavior
   - recovery loops or fail-closed state
4. Map to acceptance scenario IDs (`BLE-01`, `BLE-02`, `BLE-03`) and severity:
   - P0: no usable BLE runtime path
   - P1: unstable with workaround
   - P2: non-critical degradation
5. Escalate to firmware BLE owner with evidence bundle + reproduction steps.

---

## 8. Browser Support Triage Runbook

1. Determine lane:
   - BR-A expected supported
   - BR-B expected unsupported (serial unavailable)
   - BR-C expected insecure warning
2. Confirm banner text and capability messages match expected lane behavior.
3. If BR-A unexpectedly degrades:
   - check secure context first
   - verify Web Serial permission prompt behavior
   - verify no corporate policy/flags disabled serial API
4. Treat mismatched gating text as regression and log against `VAL-03` + capability evidence.

---

## 9. Artifact Integrity Verification Runbook
Run for firmware and runtime-web artifacts before promotion/rollback.

1. Verify checksums:
   ```bash
   cd <artifact_dir>
   sha256sum -c SHA256SUMS
   ```
2. Inspect provenance:
   ```bash
   cat provenance.json
   ```
3. Confirm minimum fields:
   - `artifact_name`
   - `commit_sha`
   - `workflow`
   - `run_id`
   - `generated_at`
4. Reject promotion when checksum fails or provenance is missing required fields.

---

## 10. Support and Escalation Guidance

### 10.1 Severity and response
- **P0:** Flashing/config transport/release integrity blocked; production deploy or recovery unsafe.
- **P1:** Core workflow degraded with workaround.
- **P2:** Non-critical issue with no launch-blocking impact.

### 10.2 Escalation path
1. Operator files issue with:
   - scenario ID(s)
   - environment/hardware/browser lane
   - evidence path
   - release/build IDs
2. Route by area:
   - Flash/Monitor/Config transport: firmware app/platform owners
   - BLE runtime: BLE owner
   - Deployment/integrity: release/DevOps owner
   - UI gating/tester behavior: web runtime owner
3. For P0, open blocker entry tied to production gate (`PG-INT`, `PG-EXT`, `PG-PROD`) and require named owner + mitigation ETA.

---

## 11. Known-Limitation Communication Template
Use in release notes/support handoffs.

- Runtime automation (`web/tests/smoke.spec.js`) validates browser shell regressions only.
- Hardware-attached outcomes (serial behavior, real flashing outcomes, BLE runtime behavior) require manual matrix evidence.
- Config transport is serial-first and requires explicit ownership state (`Flash` owner + monitor idle).
- Browser tester scope is Gamepad API visibility only; it does not prove firmware/BLE internals.

---

## 12. Operator Checklist (Quick Start)
Before shift handoff or go/no-go meeting:
1. Confirm latest candidate release ids (firmware + runtime web).
2. Run integrity verification on candidate artifacts.
3. Execute required matrix scenarios from `MANUAL_ACCEPTANCE_MATRIX.md`.
4. Update pass/fail sheet and regression log.
5. Verify all open blockers have owner/severity/gate impact.
6. Recommend go/no-go with explicit rationale and evidence references.
