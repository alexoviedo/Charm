# IMPLEMENTATION_SLICES.md

## Purpose
Break approved architecture and product constraints into the smallest safe slices.

## Program Transition
- Webapp restart program (`WR-*`) is complete and retained as historical truth.
- Production readiness program is active.
- Runtime replacement webapp remains active at `web/`.

## Production Definition Program (control)

### PROD-001 — Production program control reset
- Objective:
  - Transition control planning from restart-track execution to production-readiness execution.
- Status:
  - done
- Validation level:
  - V0 + PROD0

### PROD-002 — Production definition and release gates
- Objective:
  - Define repo-grounded minimum conditions for internal beta, external beta (if used), and production.
  - Define mandatory production capabilities, evidence gates, and blocker-clear criteria.
- Status:
  - done
- Delivered:
  - production gate definitions and release-stage minimums
  - mandatory capability list and evidence requirements
  - explicit blocker-clear requirements before production declaration
  - named production gates: `PG-INT`, `PG-EXT` (optional), `PG-PROD`
- Validation level:
  - V0 + V1 + PROD0 + PROD4

## Execution Program (next)

### FW-001 — Firmware BLE productionization baseline
- Objective:
  - Define the first narrow firmware execution scope to replace non-production BLE path assumptions.
- Status:
  - done
- Delivered:
  - BLE lifecycle behavior model defined for productionization planning
  - BLE failure taxonomy and recovery expectations defined
  - BLE acceptance evidence matrix defined for FW-002 implementation validation
- Depends on:
  - PROD-002
- Validation level:
  - V1 + PROD2

### FW-002 — Firmware BLE production implementation
- Objective:
  - Implement production-safe BLE output behavior per FW-001 boundaries.
- Status:
  - done
- Delivered:
  - stack-backed adapter start/stop lifecycle path
  - advertising readiness surfacing
  - peer connect/disconnect status surfacing
  - lifecycle error/status surfacing through existing listener boundaries
  - explicit defer of full report-notify path to FW-003
- Depends on:
  - FW-001
- Validation level:
  - V1 + PROD2

### FW-003 — BLE report-notify data path implementation
- Objective:
  - Implement report-notify data path on top of FW-002 lifecycle behavior.
- Status:
  - done
- Delivered:
  - encoded input reports are accepted from existing adapter boundary
  - report delivery is delegated through BLE backend transport path
  - transport failure/status is surfaced via existing status boundary
- Depends on:
  - FW-002
- Validation level:
  - V1 + PROD2

### FW-004 — BLE report-path hardening and callback integration
- Objective:
  - Integrate real stack callback wiring for report-channel readiness/closure and harden report-path recovery behavior.
- Status:
  - done
- Delivered:
  - report-channel readiness/closure callbacks are wired to backend channel configuration/clear behavior
  - bounded adapter recovery attempts added for lifecycle/notify-path failures with fail-closed fallback
  - session-scoped bonding material set/get/clear support added at BLE adapter boundary
  - unit tests expanded for recovery success/fail-closed cases and bonding material round-trip behavior
- Depends on:
  - FW-003
- Validation level:
  - V1 + PROD2

### CFG-001 — Host/device config transport contract freeze
- Objective:
  - Freeze first production host/device config transport path and contract from completed proof-plan truth.
- Status:
  - done
- Delivered:
  - first transport path selected as serial-primary
  - BLE config transport explicitly deferred for first slice
  - request/response/error/persistence/versioning/failure/rollback expectations frozen
  - dedicated transport contract artifact added for implementation handoff
- Depends on:
  - PROD-002
- Validation level:
  - V1 + PROD1

### CFG-002 — Host/device config protocol specification and harness alignment
- Objective:
  - Implement first narrow firmware-side config transport path using frozen serial-primary contract.
- Status:
  - done
- Delivered:
  - firmware-side config transport service for `config.persist/load/clear/get_capabilities`
  - transport-envelope validation for protocol version, request id, and integrity metadata
  - status/fault mapping through existing config store contracts
  - unit tests for validation, command handling, persistence/load/clear propagation, and capability surfacing
- Depends on:
  - CFG-001, FW-004
- Validation level:
  - V1 + PROD1

### WEB-001 — Runtime web integration for proven config transport
- Objective:
  - Enable runtime config transport only after proven transport gates pass.
- Status:
  - done
- Delivered:
  - runtime web config panel now issues serial-first config transport commands (`get_capabilities`, `persist`, `load`, `clear`)
  - ownership gating enforces serial permission + flash-owner requirements and blocks operations during flash/console sessions
  - previously blocked config-write UI state moved to truthful supported state with explicit failure/status reporting
- Depends on:
  - CFG-002
- Validation level:
  - V1 + PROD1

### WEB-002 — Web config transport protocol hardening and E2E evidence
- Objective:
  - Harden runtime web operator UX for config/flash/monitor/tester with clearer states and recovery guidance.
- Status:
  - done
- Delivered:
  - clearer disabled/ready/error state messaging and button guidance across flash/monitor/config controls
  - improved config transport operator guidance and truthful state text in runtime web panel
  - stronger recovery messaging for transport command outcomes
- Depends on:
  - WEB-001
- Validation level:
  - V1 + PROD1

### CI-001 — CI/CD release and deployment hardening
- Objective:
  - Harden release pipeline, artifact promotion controls, and rollback readiness.
- Status:
  - done
- Delivered:
  - dedicated runtime web deployment workflow (`web_runtime_deploy.yml`) added
  - explicit packaging step for runtime web assets with `current/` + `releases/<release_id>/` deploy layout
  - environment/branch promotion logic for staging/production dispatch and mainline deployment
  - deployment workflow separated from existing firmware build pipeline
- Depends on:
  - PROD-002
- Validation level:
  - V0 + V1 + PROD3

### CI-002 — Deployment promotion controls and rollback rehearsal evidence
- Objective:
  - Harden release packaging integrity/provenance outputs and operator verification guidance for firmware/web artifacts.
- Status:
  - done
- Delivered:
  - shared integrity/provenance generator script added for release artifacts
  - firmware and runtime-web workflows now emit `SHA256SUMS` + `provenance.json`
  - operator-facing verification guidance documented in release docs
- Depends on:
  - CI-001
- Validation level:
  - V0 + PROD3

### QA-001 — Release verification evidence pack and gate rehearsal
- Objective:
  - Create repeatable automated browser smoke/regression framework for runtime web shell.
- Status:
  - done
- Delivered:
  - Playwright-based smoke/regression harness added for runtime web shell
  - capability/truth-state rendering and key panel regression checks automated
  - QA automation scope/limits documented to prevent over-claiming hardware coverage
- Depends on:
  - CI-002
- Validation level:
  - V0 + V1 + PROD4

### QA-002 — Hardware-attached regression matrix and operator runbook rehearsal
- Objective:
  - Execute hardware-backed regression and runbook rehearsal evidence that browser automation cannot prove.
- Status:
  - done
- Delivered:
  - repository-grounded manual acceptance matrix for hardware/browser/environment coverage
  - exact scenario IDs with expected outcomes and mandatory evidence capture requirements
  - pass/fail sheet format, regression logging format, and gate-level go/no-go criteria
  - responsibility map by surface area (flash/monitor/config/BLE/validate/release)
- Depends on:
  - QA-001
- Validation level:
  - V0 + PROD4

### VAL-001 — Automated validation expansion
- Objective:
  - Expand automated coverage for firmware, transport, and integration gates.
- Status:
  - queued
- Depends on:
  - FW-002, CFG-002, CI-002
- Validation level:
  - V1 + PROD3

### OPS-001 — Production runbooks, rollback, and support docs
- Objective:
  - Deliver repository-grounded production operations runbooks for release, rollback, recovery, triage, and support escalation.
- Status:
  - done
- Delivered:
  - production runbooks for release/deploy verification/rollback/integrity workflows
  - recovery runbooks for firmware flashing and config transport failure states
  - BLE and browser support triage paths with severity/escalation guidance
  - known-limitation communication template for operator/support handoff
- Depends on:
  - QA-002, CI-002
- Validation level:
  - V0 + PROD4

### REL-001 — Pre-production system audit and gap closeout
- Objective:
  - Perform cross-domain pre-production audit and close any narrow, high-confidence blockers safely.
- Status:
  - done
- Delivered:
  - audit artifact with production-ready/beta-grade assessment and explicit blocker list
  - CI guardrail hardening: runtime deploy workflow now enforces web smoke checks before packaging/deploy
  - follow-on closure plan for remaining evidence/governance blockers
- Depends on:
  - OPS-001, QA-002, CI-002
- Validation level:
  - V0 + V1 + PROD4

### REL-002 — Final production-readiness audit and handoff
- Objective:
  - Produce final candid audit/handoff report and determine ship/no-ship posture against production gates.
- Status:
  - done
- Delivered:
  - final production-readiness report with gate-by-gate status and explicit recommendation
  - implemented/deferred capability inventory, remaining-risk register, and operational-readiness disposition
  - clean handoff artifact for future lead/agent continuation
- Depends on:
  - REL-001
- Validation level:
  - V0 + V1 + PROD4

### PROD-AUDIT-001 — Final production go/no-go authorization
- Objective:
  - Authorize or deny production declaration based on completed closeout packet and named approver sign-off.
- Status:
  - blocked
- Depends on:
  - launch-closeout evidence packet (post-program execution)
- Validation level:
  - V0 + PROD4

## Ranked Execution Order (active program)
| Order | Slice | Status | Notes |
|---|---|---|---|
| 1 | PROD-001 | done | Program reset complete |
| 2 | PROD-002 | done | Production/release gates defined (`PG-INT`/`PG-EXT`/`PG-PROD`) |
| 3 | FW-001 | done | Contract/validation baseline complete |
| 4 | FW-002 | done | BLE lifecycle implementation complete |
| 5 | FW-003 | done | Report-path implementation complete |
| 6 | FW-004 | done | Report-path hardening + recovery complete |
| 7 | CFG-001 | done | Config transport contract freeze complete |
| 8 | CFG-002 | done | Firmware-side config transport implementation complete |
| 9 | WEB-001 | done | Runtime config transport integration complete |
| 10 | WEB-002 | done | Runtime UX hardening complete |
| 11 | CI-001 | done | Runtime web deployment pipeline added |
| 12 | CI-002 | done | Release packaging integrity/provenance hardening complete |
| 13 | QA-001 | done | Automated browser smoke/regression framework complete |
| 14 | QA-002 | done | Manual acceptance matrix + evidence process complete |
| 15 | OPS-001 | done | Production runbooks/rollback/support documentation complete |
| 16 | REL-001 | done | Pre-production audit complete; CI smoke gate added |
| 17 | REL-002 | done | Final audit/handoff complete: recommendation is do-not-ship |
| 18 | VAL-001 | queued | Automated validation expansion |
| 19 | PROD-AUDIT-001 | blocked | Await launch-closeout packet + approvals |

## Historical WR Program (preserved)
- WR-001 .. WR-014: completed.
- WR-015: superseded by production-track transport/integration slices (`CFG-001`/`CFG-002`/`WEB-001`/`WEB-002`).
- Legacy W-series remains superseded.
