# Manual Hardware Acceptance Matrix and Evidence Capture (QA-002)

## 1) Scope and Intent
This document defines the **human-executable** acceptance process for the current production-track surface in this repository:
- runtime operator webapp in `web/` (`Flash`, `Console`, `Config`, `Validate` panels)
- firmware flashing + serial monitor operations
- serial-first config transport commands (`config.get_capabilities`, `config.load`, `config.persist`, `config.clear`)
- BLE runtime readiness checks and failure/recovery observation
- release/deployment integrity verification (`SHA256SUMS`, `provenance.json`, runtime `web/` + `releases/<release_id>/` layout)

It is deliberately aligned to existing code/docs and is not a generic QA template.

### VS-07 Pack Completion State
- **Pack defined:** YES (this document defines scenarios, procedures, evidence schema, and reporting formats).
- **Hardware evidence captured:** PER-SCENARIO (tracked in Section 1.1 and Section 5 result rows).
- **Evidence pending:** explicitly recorded as `PENDING`/`BLOCKED` with owner + reason; never implied as pass.
- **No fabricated evidence policy:** if hardware is unavailable, record `PENDING` with blocker details instead of synthetic PASS.

## 1.1 Scenario Status Ledger (Authoritative for VS-07)
Use this ledger to distinguish definition-complete vs evidence-complete.

| Scenario ID | Category | Mandatory for Production Confidence | Pack Status | Evidence Status (`CAPTURED` / `PENDING` / `BLOCKED`) | Last Run (UTC) | Evidence Path / Link | Blocker Owner |
|---|---|---|---|---|---|---|---|
| FL-01 | Flash success | Yes | Defined | PENDING | TBD | TBD | HW QA Owner |
| FL-03 | Flash failure/recovery | Yes | Defined | PENDING | TBD | TBD | HW QA Owner |
| MON-01 | Serial monitor connect/disconnect/read | Yes | Defined | PENDING | TBD | TBD | HW QA Owner |
| CFG-01 | Config transport success | Yes | Defined | PENDING | TBD | TBD | FW App Owner |
| CFG-06 | Config transport malformed/error | Yes | Defined | PENDING | TBD | TBD | FW App Owner |
| BLE-01 | BLE connection/report path | Yes | Defined | PENDING | TBD | TBD | BLE Owner |
| BLE-03 | BLE disconnect/recovery behavior | Yes | Defined | PENDING | TBD | TBD | BLE Owner |
| STG-01 | Startup storage visible behavior | Yes | Defined | PENDING | TBD | TBD | FW App Owner |
| REL-01 | Build/artifact traceability | Yes | Defined | PENDING | TBD | TBD | Release Owner |

---

## 2) Supported Test Matrix (Hardware / Browser / Environment)

### 2.1 Hardware Matrix
| Matrix ID | Device/Build | Connection | Required For | Notes |
|---|---|---|---|---|
| HW-A | ESP32-S3 production-like board with current firmware artifact | USB data cable | Flash, Console, Config, Validate, Recovery | Primary acceptance lane |
| HW-B | Second ESP32-S3 board (older or previous known-good firmware) | USB data cable | Upgrade/rollback + regression confidence | Confirms non-single-device bias |
| HW-C | BLE-capable setup with phone/host peer for runtime behavior observation | BLE + USB (for logs) | BLE runtime behavior + recovery evidence | BLE behavior is mandatory for production gate |

### 2.2 Browser Matrix
| Matrix ID | Browser | Secure Context | Required APIs | Expected Banner |
|---|---|---|---|---|
| BR-A | Chromium (stable) desktop | `https` or loopback secure context | Web Serial (+ optional Gamepad) | Supported Environment |
| BR-B | Chromium variant with Web Serial unavailable | secure | no `navigator.serial` | Unsupported Browser |
| BR-C | Any browser in insecure context | non-secure | n/a | Insecure Context |

### 2.3 Environment Matrix
| Matrix ID | Environment | Runtime Source | Required Artifact Shape |
|---|---|---|---|
| ENV-A | Local operator test | `web/` served locally | firmware manifest + binaries, config controls visible |
| ENV-B | Staging deployment | `web/` package from release pipeline | `deploy-metadata.json`, `SHA256SUMS`, `provenance.json` |
| ENV-C | Production-like rehearsal | `releases/<release_id>/` snapshot + rollback candidate | Same integrity/provenance checks + rollback path evidence |

---

## 3) Test Scenario Set (Exact Scenarios)

Use these IDs in evidence and pass/fail records.

### A. Firmware Flashing
| ID | Scenario | Steps (exact) | Expected Outcome | Evidence |
|---|---|---|---|---|
| FL-01 | Happy-path flash from runtime | Open `Flash` panel → load artifact bundle → request serial permission → claim Flash owner → identify target → execute flash | Device identified, progress reaches completion, no unhandled error status | Screenshot of Flash panel start+finish, artifact summary, serial ownership state, timestamped note |
| FL-02 | Flash blocked when serial ownership invalid | Keep owner as Console or none; attempt flash | Flash action disabled or explicit ownership error | Screenshot of disabled control or error banner |
| FL-03 | Flash interruption recovery | Start flash then force disconnect/reset USB link | Failure reported clearly; user can recover by reconnecting and re-running | Console log excerpt + screenshot of failure state + successful retry evidence |

### B. Serial Monitor
| ID | Scenario | Steps (exact) | Expected Outcome | Evidence |
|---|---|---|---|---|
| MON-01 | Connect/disconnect monitor | Open `Console` panel → connect → observe output → disconnect | Connect status updates; logs stream; disconnect returns to idle | Screenshot of connected and disconnected states |
| MON-02 | Auto-scroll + clear output behavior | Enable/disable auto-scroll while logs incoming; use clear output | Output behavior matches toggles; clear empties buffer | Short screen recording or two screenshots + tester notes |
| MON-03 | Ownership contention with flash/config | While monitor active, attempt flash/config device command | Operation blocked with clear message about active monitor/ownership separation | Screenshot with blocking status text |

### C. Config Write/Persist (serial-first)
| ID | Scenario | Steps (exact) | Expected Outcome | Evidence |
|---|---|---|---|---|
| CFG-01 | Device capabilities query | `Config` panel → Device: Get Capabilities | Response shown in config status/write status area; no transport parse error | Screenshot + captured response text |
| CFG-02 | Load persisted config | Device: Load Config | Draft summary updates or explicit empty/default response shown | Screenshot of summary + status |
| CFG-03 | Persist validated draft | Edit draft to valid state → Validate Local Draft → Device: Persist Local Draft | Persist success shown; no timeout/ownership errors | Screenshot of validation state + write status |
| CFG-04 | Clear persisted config | Device: Clear Config then Device: Load Config | Clear success; reload shows cleared/default state | Screenshot pair (before/after) |
| CFG-05 | Negative: blocked during monitor/flash | Keep monitor connected or flash in progress, then run device config command | Command blocked with expected guardrail message | Screenshot of blocked action/message |
| CFG-06 | Negative: malformed config transport request | Send malformed frame through serial config channel (missing required field / invalid command) and observe response path | Deterministic reject/error status surfaced, no crash, monitor remains usable | Raw serial transcript + screenshot of surfaced error state |

### D. BLE Runtime Behavior
| ID | Scenario | Steps (exact) | Expected Outcome | Evidence |
|---|---|---|---|---|
| BLE-01 | Start + advertise readiness | Boot firmware with BLE enabled and observe runtime path | Device reaches advertising/ready state per runtime logs/status signals | Serial log excerpt with timestamp + tester annotation |
| BLE-02 | Peer connect/disconnect cycle | Connect BLE peer, exercise brief traffic, disconnect | Status transitions are coherent; no stuck state after disconnect | Serial log excerpt and pass/fail note |
| BLE-03 | Recovery after runtime fault | Trigger representative BLE failure path (drop peer/reset) | Bounded recovery attempt observed; fail-closed posture if unrecoverable | Log excerpt showing retries/fail-closed behavior |

### E. Validation/Tester Behavior
| ID | Scenario | Steps (exact) | Expected Outcome | Evidence |
|---|---|---|---|---|
| VAL-01 | No-controller baseline | Open `Validate` without controller input | “no controller” state visible and stable | Screenshot |
| VAL-02 | Live controller input reflection | Connect controller and actuate buttons/axes | Buttons/axes update in tester UI and neutral guidance remains coherent | Screenshot or short video |
| VAL-03 | Capability gating alignment | Test BR-A/BR-B/BR-C paths | Banner and guidance text match capability state | Screenshot per path |

### F. Recovery / Error States
| ID | Scenario | Steps (exact) | Expected Outcome | Evidence |
|---|---|---|---|---|
| REC-01 | Permission denied on serial request | Deny permission prompt | UI indicates not granted; privileged actions remain blocked | Screenshot |
| REC-02 | Port disconnect during active session | Disconnect cable during monitor/config/flash | Session error surfaced; recover path documented and works | Error screenshot + retry success proof |
| REC-03 | Invalid local artifact/config input | Provide malformed file where applicable | Validation/error messaging explicit and non-crashing | Screenshot + file name/hash in notes |

### H. Startup Storage Lifecycle (Operator-Visible)
| ID | Scenario | Steps (exact) | Expected Outcome | Evidence |
|---|---|---|---|---|
| STG-01 | Normal startup with initialized storage | Boot device with valid persisted storage state; connect runtime/monitor and run config capability/load checks | Startup proceeds normally; config operations available and deterministic | Boot log excerpt + config panel screenshot + timestamp |
| STG-02 | Startup with recoverable storage condition | Prepare recoverable NVS condition (where supported), reboot, then observe startup and retry behavior | Bounded recovery path completes; runtime becomes usable without manual firmware patching | Boot log excerpt showing recover path + post-boot capability/load proof |
| STG-03 | Startup unrecoverable storage failure | Force unrecoverable storage init failure (lab procedure), reboot | Fail-closed behavior: startup flow blocked appropriately; fault visibility captured for operator/tester | Boot log excerpt + operator-visible failure screenshot + blocker record |

### G. Deployment / Release Verification
| ID | Scenario | Steps (exact) | Expected Outcome | Evidence |
|---|---|---|---|---|
| REL-01 | Runtime package shape verification | Inspect deployment artifact | Contains `web/`, `releases/<release_id>/`, `deploy-metadata.json` | Terminal transcript + artifact listing screenshot |
| REL-02 | Integrity verification | In artifact dir: `sha256sum -c SHA256SUMS` | All required files verify OK | Terminal transcript |
| REL-03 | Provenance verification | Inspect `provenance.json` and check required fields | Fields present: artifact, commit/workflow/run metadata, generated timestamp | Captured JSON snippet or screenshot |
| REL-04 | Rollback rehearsal | Deploy prior known-good release snapshot | `web/` serves previous version successfully | Before/after evidence + change ticket reference |

---

## 4) Evidence Capture Requirements
For every scenario row executed, capture all of:
1. **Execution metadata:** date/time (UTC), tester name, device id/serial, firmware artifact id (commit/release id), browser + version.
2. **Outcome proof:** screenshot/video/log excerpt directly showing expected result.
3. **Traceability:** scenario ID, environment ID, and gate relevance (`PG-INT`, `PG-EXT`, `PG-PROD`).
4. **Defect linkage:** if failed, include defect/regression ID and owner.
5. **Artifact linkage:** artifact/checksum/provenance references used in execution (`manifest.json`, `SHA256SUMS`, `provenance.json` where applicable).

Minimum evidence package folder naming:
- `evidence/<YYYYMMDD>/<scenario-id>/<tester>-<utc-time>/...`

Minimum files per scenario evidence folder:
- `result.json` (structured metadata + PASS/FAIL/PENDING/BLOCKED)
- `notes.md` (human observations + anomalies)
- `logs/` (serial/runtime logs)
- `media/` (screenshots/photos/video snippets as applicable)
- `traceability.json` (commit SHA, release id, artifact paths, checksums references)

---

## 4.1 Reproducible Execution Procedure (Apply to Every Scenario)
1. Record baseline metadata (tester, UTC start, device ID, firmware build/release ID, browser/version, scenario ID).
2. Verify required prerequisites (HW/BR/ENV lanes and artifact availability).
3. Execute exact scenario steps from Section 3 without deviation; if deviation is needed, document it in `notes.md`.
4. Capture required evidence artifacts immediately (logs/media/traceability files).
5. Assign result status (`PASS`, `FAIL`, `PENDING`, `BLOCKED`) and update Section 1.1 + Section 5 row.
6. For non-pass outcomes, create/attach defect or blocker owner and mitigation/next action.
7. Store all artifacts under the required evidence folder naming convention.

---

## 5) Pass/Fail Recording Format (Operator Sheet)
Use one row per scenario execution.

| Scenario ID | Date (UTC) | Tester | HW/BR/ENV IDs | Build/Release ID | Commit SHA | Artifact/Checksum Ref | Result (PASS/FAIL/PENDING/BLOCKED) | Evidence Path | Defect/Issue ID | Notes |
|---|---|---|---|---|---|---|---|---|
| CFG-03 | 2026-03-28 | initials | HW-A / BR-A / ENV-B | `<release_id>` | `<commit_sha>` | `SHA256SUMS:OK` | PASS | `evidence/20260328/CFG-03/...` | n/a | Persist ack in status panel |

`PENDING` means not yet executed (no claim).
`BLOCKED` is allowed only with explicit blocker owner + ETA.

---

## 6) Regression Logging Format
When a previously passing scenario fails:

| Regression ID | First Seen (UTC) | Scenario ID | Previous Good Build | Failing Build | Severity (P0/P1/P2) | Owner | Customer/Operator Impact | Mitigation | Status |
|---|---|---|---|---|---|---|---|---|---|
| REG-2026-03-28-01 | 2026-03-28T18:00:00Z | MON-03 | `<good>` | `<bad>` | P0 | `<owner>` | Flash blocked unexpectedly | Roll back to `<good>` | Open |

Severity policy:
- **P0:** blocks flash/config/monitor safety-critical workflow or release integrity verification.
- **P1:** major degraded behavior with workaround.
- **P2:** minor UX/documentation issue.

---

## 7) Go / No-Go Criteria

### Internal Beta (`PG-INT`) Go Conditions
- All `FL-*`, `MON-*`, `CFG-*`, `VAL-*` scenarios pass on at least **HW-A + BR-A + ENV-A**.
- No open P0 regressions.
- `REL-01..03` pass for candidate artifact set.

No-Go triggers:
- Any FAIL in `FL-*` or `CFG-*` without approved mitigation.
- Missing evidence for mandatory scenarios.

### External Beta (`PG-EXT`) Go Conditions (if used)
- `PG-INT` passed.
- Cross-check run completed on **HW-B** and at least one negative browser lane (`BR-B` or `BR-C`).
- `REL-04` rollback rehearsal completed with evidence.

No-Go triggers:
- Rollback rehearsal missing/failing.
- Unowned blocker in external beta scope.

### Production (`PG-PROD`) Go Conditions
- All mandatory scenario groups `FL/MON/CFG/BLE/STG/VAL/REC/REL` have pass evidence in production-like environment.
- BLE scenarios (`BLE-01..03`) passed with no unresolved P0/P1 in release candidate.
- Integrity/provenance verification passed for release artifact.
- Residual risks documented with owner, mitigation, and explicit acceptance.

No-Go triggers:
- Any unresolved P0.
- Any missing mandatory evidence row in production scope.
- Failed integrity/provenance verification.

---

## 8) Ownership and Responsibility Map
| Area | Primary Owner | Supporting Owner(s) | Approval Required For Gate |
|---|---|---|---|
| Flash + Serial ownership model (`Flash` panel) | Firmware/Platform engineer | Web runtime engineer | `PG-INT`, `PG-PROD` |
| Serial monitor (`Console` panel) | Firmware/Platform engineer | QA operator | `PG-INT` |
| Config transport (`Config` panel + serial commands) | Firmware app owner | Web runtime engineer, QA operator | `PG-INT`, `PG-PROD` |
| BLE runtime behavior | Firmware BLE owner | QA operator | `PG-PROD` |
| Validate/tester panel behavior | Web runtime engineer | QA operator | `PG-INT` |
| Recovery/error-state coverage | QA lead | Firmware + web owners | all gates |
| Deployment/release integrity/provenance verification | Release/DevOps owner | QA lead | `PG-EXT`, `PG-PROD` |

Approval rule: a gate can be declared passed only when each in-scope area has a named owner sign-off and attached evidence references.

---

## 9) Human-Usability Checklist (Before Running)
- Tester can identify each panel/control in runtime webapp (`Flash`, `Console`, `Config`, `Validate`).
- Tester has this matrix file and a writable result sheet (table from Section 5).
- Tester has artifact identifiers and evidence destination path pre-created.
- Tester understands blocker escalation path (owner + severity + gate impact).

If any item above is missing, mark session `BLOCKED` and do not claim gate progress.
