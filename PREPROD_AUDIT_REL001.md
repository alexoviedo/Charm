# REL-001 Pre-Production System Audit and Gap Closeout

Date: 2026-03-28 (UTC)
Scope: firmware, webapp, CI/release, QA evidence, operations docs, control truth

## 1) Readiness Assessment (Current)

### 1.1 Production-ready now (engineering foundation)
- Runtime web deployment pipeline is separated and produces versioned runtime outputs (`web/`, `releases/<release_id>/`) plus deploy metadata.
- Release integrity/provenance tooling exists and works for runtime artifacts (`SHA256SUMS`, `provenance.json`).
- Firmware build workflow emits firmware web-flash artifact bundle and integrity/provenance outputs.
- Browser smoke suite exists and passes locally for top-level runtime shell/capability/config-panel flows.
- Manual acceptance matrix + operations runbooks are present and repository-grounded.

### 1.2 Beta-grade only (not sufficient for production declaration)
- Hardware-attached acceptance evidence is still process-defined but not consolidated as a completed release rehearsal evidence pack.
- BLE production readiness remains evidence-dependent (manual matrix execution required) rather than proven by automated CI checks.
- Unit/integration test evidence for firmware paths is not continuously verified in this audit environment (no built unit-test tree in this run).

### 1.3 Production blockers (must close before PROD audit pass)
1. **B-001 (closed in this slice):** Runtime web deploy workflow did not enforce smoke checks before packaging/deploy.
2. **B-002 (open):** No completed REL rehearsal evidence bundle proving end-to-end candidate, rollback drill, and gate recommendation.
3. **B-003 (open):** Hardware/BLE/manual matrix execution evidence for production candidate remains outstanding.
4. **B-004 (open):** Final sign-off/governance package (approvers, residual-risk acceptance) not yet assembled.

---

## 2) Narrow Fixes Applied in REL-001

### Fix F-001: enforce web smoke checks in deployment workflow
- Added `actions/setup-node@v4` + `npm --prefix web ci` + `npm --prefix web run qa:smoke` in `.github/workflows/web_runtime_deploy.yml` package job prior to packaging runtime site.
- Effect: prevents deploying runtime web changes when smoke regression baseline is red.
- Risk profile: narrow CI-only change; no runtime/firmware behavior modification.

---

## 3) Gaps Requiring Follow-on Slice

### Must be handled in REL-002
- Execute full release rehearsal against candidate artifacts using `OPERATIONS_RUNBOOKS.md` + `MANUAL_ACCEPTANCE_MATRIX.md`.
- Capture and store evidence rows for mandatory release, recovery, rollback, config transport, and BLE scenarios.
- Produce a consolidated gate packet: integrity/provenance outputs, matrix results, blocker register, and explicit go/no-go recommendation.

---

## 4) Updated Launch Readiness Position
- **Engineering baseline:** strong and mostly production-grade after F-001 CI smoke gating.
- **Operational launch confidence:** not yet production-ready until REL-002 evidence execution completes and open blockers B-002/B-003/B-004 are closed.
- **Recommended posture now:** `PG-PROD` remains closed.
