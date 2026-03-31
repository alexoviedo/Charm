# Changelog (AI)

## [Unreleased]
### Added
- Executed AUTH-HOLD-001 final post-program audit and published a retained authorization-hold decision record (`AUTH_HOLD_001_FINAL_AUDIT.md`) with explicit do-not-ship posture.
- Completed VS-08 by publishing a final release/rollback/gate-closure package with explicit blocked/do-not-ship posture, evidence map, rollback status, and sign-off placeholders.
- Completed VS-07 by defining an auditable end-to-end hardware validation pack with scenario IDs, reproducible procedures, mandatory coverage, and explicit evidence captured/pending tracking.
- Completed VS-06 by consolidating runtime web to canonical `web/` and removing non-canonical `web-next/` to eliminate drift ambiguity.
- Completed VS-05 by adding a repo-local GTest bootstrap fallback for host/unit tests and validating clean-environment configure/build without manual preinstallation.
- Completed VS-04 by adding explicit startup storage initialization/recovery and fail-closed config-activation gating with host-test evidence.
- Completed VS-03 by wiring BLE stack callback registration/dispatch into `BleTransportAdapter` lifecycle/report-channel handlers with bounded fail-closed recovery and host-test evidence.
- Completed VS-02 by implementing a serial-first runtime config transport adapter (`ConfigTransportRuntimeAdapter`) and passing adapter/service host tests locally.
- Completed VS-01 evidence closure by installing local GTest prerequisites and executing `RuntimeDataPlaneTest` plus full unit test suite locally.
- Implemented VS-01 runtime data-plane orchestration in app layer (`runtime_data_plane`) plus unit-test coverage scaffold (validation execution pending environment dependencies).
- Executed `VS-01` readiness/planning phase and added `VS_01_RUNTIME_DATA_PLANE_READINESS.md` (no runtime code changes).
- Executed `VS-PROG-001 — Control reset into the production vertical-slice program`.
- Set the active execution queue to `VS-01`..`VS-08`, explicitly mapped to verified gaps `G-001`..`G-006`.
- Executed `WR-014 — Cutover and legacy web removal`.
- Executed a control-only `WR-015` planning update to define the serial control/config proof matrix requirements.
- Executed `PROD-001 — Production program control reset`.
- Executed `PROD-002 — Production definition and release gates`.
- Executed `FW-001 — Firmware BLE productionization baseline` (contract/validation only).
- Executed `FW-002 — Real BLE transport lifecycle implementation` (narrow scope).
- Executed `FW-003 — Real BLE HID/report path implementation` (narrow scope).
- Executed `FW-004 — BLE report-path hardening and callback integration` (narrow scope).
- Executed `CFG-001 — Host/device config transport contract freeze` (control/design scope).
- Executed `CFG-002 — Firmware-side config transport implementation` (narrow firmware scope).
- Executed `WEB-001 — Webapp integration for real config transport` (narrow runtime scope).
- Executed `WEB-002 — Production UX hardening for config/flash/monitor/tester` (webapp-only hardening scope).
- Executed `CI-001 — Production web deployment pipeline` (CI/CD + deployment scope).
- Executed `CI-002 — Release packaging, provenance, and integrity hardening` (CI/release hardening scope).
- Executed `QA-001 — Automated browser smoke/regression framework` (QA/webapp scope).
- Executed `QA-002 — Manual hardware acceptance matrix and evidence capture` (QA/control scope).
- Executed `OPS-001 — Production runbooks, rollback, and support docs` (operations/control scope).
- Executed `REL-001 — Pre-production system audit and gap closeout` (audit/control scope + narrow CI guardrail fix).
- Executed `REL-002 — Final production-readiness audit and handoff` (audit/handoff scope).

### Changed
- Marked VS-08 done after closure-package publication and moved active work to AUTH-HOLD-001 final authorization hold.
- Marked VS-07 done after validation-pack completion and moved active slice to VS-08.
- Marked VS-06 done after local execution evidence and moved active slice to VS-07.
- Marked VS-05 done after local execution evidence and moved active slice to VS-06.
- Marked VS-04 done after local execution evidence and moved active slice to VS-05.
- Marked VS-03 done after local execution evidence and moved active slice to VS-04.
- Marked VS-02 done after local execution evidence and moved active slice to VS-03.
- Marked VS-01 done after local execution evidence and moved active slice to VS-02.
- Replaced active current-task posture with `VS-01 Runtime Data Plane Integration` as the single in-progress slice.
- Re-aligned control files for a code-first vertical-slice program while preserving prior WR/PROD/FW/CFG/WEB/CI/QA/OPS/REL history as historical record.
- Replaced legacy runtime `web/` implementation with the validated replacement implementation formerly staged in `web-next/`.
- Runtime truth updated: replacement shell is now the active runtime webapp at `web/`.
- Updated control tracking: WR-014 done and WR-015 in progress (planning), with runtime write/persist still blocked on transport proof evidence.
- Updated WR-015 status to in-progress for proof-matrix definition while runtime config write/persist remains blocked pending execution evidence.
- Transitioned active planning from WR restart-track to PROD production-readiness track, preserving WR history and setting `PROD-002` as next active slice.
- Defined minimum conditions for internal beta, external beta (optional), and production, plus mandatory production capabilities and required evidence gates.
- Set `FW-001` as the next active execution slice.
- Formalized named production gates: `PG-INT`, `PG-EXT` (optional), and `PG-PROD`, and recorded current posture (`PG-PROD` closed pending mandatory blockers/evidence).
- Completed FW-001 control outputs (BLE lifecycle/failure model + acceptance matrix) and promoted `FW-002` as next active slice.
- Completed FW-002 lifecycle scope and promoted `FW-003` (report-notify path) as next active slice.
- Completed FW-003 report path scope and promoted `FW-004` (callback/hardening path) as next active slice.
- Completed FW-004 hardening scope (callback-channel integration, bounded recovery, session-scoped bonding material handling) and promoted `CFG-001` as next active slice.
- Completed CFG-001 contract freeze and promoted `CFG-002` (protocol spec + harness alignment) as next active slice.
- Completed CFG-002 firmware-side transport implementation and promoted `WEB-001` as next active slice.
- Completed WEB-001 runtime integration for serial-first config transport and promoted `WEB-002` as next active slice.
- Completed WEB-002 UX hardening and promoted `CI-001` as next active slice.
- Completed CI-001 runtime web deployment pipeline and promoted `CI-002` as next active slice.
- Completed CI-002 release hardening and promoted `QA-001` as next active slice.
- Completed QA-001 automated browser smoke/regression framework and promoted `QA-002` as next active slice.
- Completed QA-002 manual acceptance matrix/evidence framework and promoted `OPS-001` as next active slice.
- Completed OPS-001 production runbooks/support docs and promoted `REL-001` as next active slice.
- Completed REL-001 audit, added deploy smoke gating, and promoted `REL-002` as next active slice.
- Completed REL-002 final audit/handoff and recorded do-not-ship production recommendation pending closeout packet + approvals.

## 2026-03-27
Executed `WR-002 — Artifact contract and source decision`.

Files covered:
- DECISIONS.md
- INTERFACES.md
- VALIDATION.md
- IMPLEMENTATION_SLICES.md
- TODO.md
- CHANGELOG_AI.md
- CURRENT_TASK.md

What changed:
- Added explicit accepted/rejected artifact-source rules and minimum artifact set.
- Defined artifact-mode contracts, validation expectations, and mode-agnostic bundle requirements.
- Marked WR-002 done and set WR-003 as the next active slice.

What did not change:
- No `web/` or `web-next/` runtime files.
- No workflow behavior changes.
- No firmware code, firmware release behavior, BLE behavior, or USB behavior changes.

Why:
- To lock artifact ingestion and flash-input assumptions before rebuilding the replacement flasher.

Validation:
- Performed control-file consistency checks for slice status, artifact contract coverage, and scope protection.
