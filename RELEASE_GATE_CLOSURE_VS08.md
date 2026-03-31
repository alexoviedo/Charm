# VS-08 Release, Rollback, and Production Gate Closure Package

## 1) Purpose and Scope
This document is the VS-08 closure package for final release/rollback/gate review.
It consolidates current repo-grounded evidence inputs and records an explicit ship posture.

**Truth policy:**
- No fabricated hardware evidence.
- No fabricated rollback rehearsal results.
- No fabricated approval/sign-off entries.

---

## 2) Production Gate Checklist (Current Candidate)

| Gate Item ID | Requirement | Evidence Source(s) | Current Status | Notes |
|---|---|---|---|---|
| GATE-01 | Implementation slices VS-01..VS-06 completed and tracked | `IMPLEMENTATION_SLICES.md`, `TODO.md`, `CHANGELOG_AI.md` | SATISFIED | Recorded as done in control files. |
| GATE-02 | Host automated/unit evidence for implemented slices available | `tests/unit`, prior ctest evidence in changelog/control trail | SATISFIED | Host evidence exists; hardware evidence separate. |
| GATE-03 | Hardware validation pack exists and is executable | `MANUAL_ACCEPTANCE_MATRIX.md` | SATISFIED | Pack defined with scenario ledger + procedures. |
| GATE-04 | Mandatory hardware scenarios executed with pass evidence | `MANUAL_ACCEPTANCE_MATRIX.md` Section 1.1 + Section 5 rows | PENDING | Scenario ledger is currently `PENDING` unless lab captures are attached. |
| GATE-05 | Release artifact integrity/provenance verification defined and executed for candidate | `scripts/generate_release_integrity.sh`, workflow logs/artifacts | PARTIAL | Verification method exists; candidate-specific execution evidence pending in this environment. |
| GATE-06 | Rollback rehearsal executed and evidenced | `MANUAL_ACCEPTANCE_MATRIX.md` REL-04, `OPERATIONS_RUNBOOKS.md` rollback sections | PENDING | Rehearsal steps defined; no attached rehearsal result bundle here. |
| GATE-07 | Approval/sign-off matrix completed | Section 6 below | PENDING | Owner roles defined; sign-offs not yet recorded. |

---

## 3) Evidence Map (Repo-Grounded)

### 3.1 Implementation Evidence
- Runtime data-plane: VS-01 records + tests (`RuntimeDataPlaneTest`).
- Config transport adapter: VS-02 records + tests (`ConfigTransportRuntimeAdapterTest`).
- BLE callback wiring: VS-03 records + tests (`BleTransportAdapterTest`).
- Startup storage lifecycle: VS-04 records + tests (`StartupStorageLifecycleTest`).
- Test bootstrap portability: VS-05 records + clean-env GTest fallback evidence.
- Web runtime consolidation: VS-06 records (`web/` canonical, `web-next/` removed).

Primary pointers:
- `IMPLEMENTATION_SLICES.md`
- `TODO.md`
- `CHANGELOG_AI.md`

### 3.2 Automated Test Evidence
- Unit harness and targets: `tests/unit/CMakeLists.txt`
- Existing unit sources under `tests/unit/`
- Local execution command pattern:
  - `cmake -S tests/unit -B build/tests`
  - `cmake --build build/tests -j`
  - `ctest --test-dir build/tests --output-on-failure`

### 3.3 Manual / Hardware Validation Inputs
- Full hardware validation pack and evidence formats:
  - `MANUAL_ACCEPTANCE_MATRIX.md`
- Runtime web QA automation boundary:
  - `web/QA_AUTOMATION.md`

### 3.4 Integrity / Provenance Inputs
- Packaging: `scripts/package_web_runtime.sh`
- Integrity generation: `scripts/generate_release_integrity.sh`
- Release/deploy workflow wiring: `.github/workflows/release.yml`

### 3.5 Rollback Inputs
- Rollback definitions/runbook steps:
  - `OPERATIONS_RUNBOOKS.md` (runtime web rollback + firmware rollback sections)
- Rehearsal evidence target scenarios:
  - `MANUAL_ACCEPTANCE_MATRIX.md` scenario `REL-04`

### 3.6 Approval / Sign-off Inputs
- Owner responsibility map:
  - `MANUAL_ACCEPTANCE_MATRIX.md` Section 8
- Sign-off capture table (Section 6 below)

---

## 4) Rollback Closure Section

### 4.1 What rollback means in this repo
- **Runtime web rollback:** redeploy prior known-good runtime package/snapshot.
- **Firmware rollback:** flash prior known-good firmware artifacts after integrity/provenance verification.

### 4.2 What has been rehearsed
- **Documented only** (runbook + scenario definitions present).

### 4.3 What is pending
- Candidate-specific rollback rehearsal execution records and evidence bundles (logs/screenshots/metadata) for `REL-04`.

Status: **PENDING (fail-closed)**.

---

## 5) Release Closure Section

### 5.1 Candidate release artifact linkage requirements
For any ship decision, each candidate must bind:
- release id
- commit SHA
- firmware artifact set + manifest
- runtime web package
- `SHA256SUMS` verification output
- `provenance.json` fields check

### 5.2 Current satisfaction state
- **Mechanism defined:** yes (scripts/workflow/runbooks).
- **Candidate-specific verified bundle in this environment:** pending.

Status: **PARTIAL (fail-closed for ship decision)**.

---

## 6) Approval / Sign-off Matrix (Placeholders, No Fabricated Sign-off)

| Area | Required Approver Role | Status | Evidence Link | Timestamp (UTC) | Notes |
|---|---|---|---|---|---|
| Firmware runtime behavior | Firmware lead | PENDING | TBD | TBD | Includes BLE + config + startup behaviors |
| Runtime web operations | Web/runtime lead | PENDING | TBD | TBD | Includes flash/console/config/validate operational behavior |
| QA/hardware execution | QA lead | PENDING | TBD | TBD | Mandatory hardware scenarios complete |
| Release integrity/provenance | Release/DevOps owner | PENDING | TBD | TBD | Candidate artifact verification complete |
| Rollback rehearsal | Operations owner | PENDING | TBD | TBD | REL-04 evidence attached |
| Final authorization | Program/product authority | PENDING | TBD | TBD | Final ship/no-ship decision |

---

## 7) Current Decision Record

- **Decision:** **BLOCKED PENDING CLOSEOUT**
- **Ship posture:** **DO NOT SHIP**
- **Reason:** Mandatory hardware evidence execution, rollback rehearsal results, and accountable sign-offs are not yet attached in this repo state.

### Conditions required before a ship decision is allowed
1. Mandatory VS-07 scenarios executed with attached PASS evidence (or approved mitigations for non-pass outcomes).
2. Rollback rehearsal (`REL-04`) executed and evidenced.
3. Candidate artifact integrity/provenance checks executed and attached.
4. Sign-off matrix completed with named approvers and timestamps.

---

## 8) Residual Risk Register (Final Gate Review)

| Risk ID | Risk | Current Exposure | Mitigation Required Before Ship | Owner | Status |
|---|---|---|---|---|---|
| R-001 | Hardware runtime behavior not evidenced for candidate | High | Execute mandatory hardware scenarios and attach evidence bundle | QA lead + firmware lead | Open |
| R-002 | Rollback viability unproven for candidate release | High | Complete rollback rehearsal with evidence (`REL-04`) | Operations owner | Open |
| R-003 | Integrity/provenance verification not attached for final candidate | Medium | Run checksum/provenance verification and archive outputs | Release/DevOps owner | Open |
| R-004 | Missing accountable final approvals | High | Complete sign-off matrix with timestamps and evidence links | Program authority | Open |

---

## 9) VS-08 Completion Statement
VS-08 is complete as a **closure package artifact**.
The package explicitly records a blocked/do-not-ship posture until pending evidence and approvals are satisfied.
