# VALIDATION.md

## Purpose
Define how each slice is validated before approval.
Validation is required before implementation moves forward.

## Slice Workflow
1. Define scope
2. Identify assumptions, ambiguities, dependencies, risks, and missing contracts
3. List touched files and why each must change
4. Define validation and acceptance criteria
5. Implement only after approval
6. Record validation evidence and handoff

## Validation Levels

### V0 — Documentation / Control Slice
Use for:
- control files
- architecture wording
- backlog/decision/interface updates

Required checks:
- internal consistency
- no implementation logic
- no hidden requirement invention
- correct separation of stable truth vs unresolved decisions
- exactly one active current task entry in `CURRENT_TASK.md`

### V1 — Contract / Interface Slice
Use for:
- interface definitions
- event shapes
- schema boundaries
- invariants
- dependency rules
- error categories

Required checks:
- no platform leakage into core contracts
- no transport/translation coupling
- invariants stated clearly
- unresolved items called out explicitly
- allowed and forbidden dependency rules are explicit
- persistence boundaries are stated without inventing backend details

### PROD0 — Production Program Control Validation
Use for:
- production program control resets and program-level planning updates

Required checks:
- completed WR history remains truthful and preserved
- active task is production-track and singular
- production blockers are explicit and mapped to slices
- no runtime/firmware/workflow implementation files modified in control-only slice
- runtime cutover truth (`web/` active replacement runtime) remains explicit

### PROD1 — Transport Proof Validation
Use for:
- host/device config transport contract/protocol planning and proof execution

Required checks:
- request/response mapping remains anchored to existing repo contracts
- status/fault mapping remains lossless
- positive/negative/recovery evidence matrix is explicit
- if proof is incomplete, runtime write/persist stays blocked (`blocked_unproven_transport`)

CFG-001 acceptance evidence (contract freeze scope):
- first production transport path is explicit and singular
- serial-primary posture is explicitly accepted/rejected (not ambiguous)
- BLE config transport posture is explicit (deferred/optional/supported)
- request/response/error/persistence/versioning/failure/rollback expectations are frozen in a dedicated contract artifact

CFG-002 implementation evidence (firmware-side transport scope):
- firmware handler accepts frozen command set (`persist/load/clear/get_capabilities`)
- protocol version/request-id/integrity validation is deterministic and fail-closed
- persist/load/clear results map status/fault losslessly from config store contracts
- capabilities response explicitly advertises serial-first support and BLE-transport non-support

WEB-001 implementation evidence (runtime web integration scope):
- config panel invokes serial-first `persist/load/clear/get_capabilities` commands
- ownership/capability gates prevent transport calls during console/flash contention
- blocked config-write UI state is updated to truthful supported state
- transport failures/timeouts surface explicit error status to user

WEB-002 implementation evidence (runtime UX hardening scope):
- flash/monitor/config controls expose consistent ready/blocked/error disabled-state guidance
- operator-facing recovery guidance is explicit in config transport panel
- runtime truth text is aligned across capability, panel lead text, and status surfaces

### PROD2 — BLE Productionization Validation
Use for:
- firmware BLE transport production-readiness slices

Required checks:
- mock/placeholder behavior is replaced by production-safe behavior in approved slices
- behavior and failure handling are deterministic and testable
- adapter boundary rules remain intact

FW-001 acceptance evidence matrix (required rows):
- Behavior rows:
  - state transition traces for start -> advertising -> connected -> disconnected -> stopped
  - invariant checks proving fail-closed posture on unrecoverable BLE errors
- Failure-class rows:
  - `ble_init_failure`
  - `ble_advertise_failure`
  - `ble_connection_drop`
  - `ble_notify_failure`
  - `ble_resource_exhaustion`
  - `ble_recovery_timeout`
- Recovery rows:
  - bounded retries for recoverable errors
  - terminal safe posture after repeated unrecoverable failures

Per-row evidence minimum:
- test id
- preconditions
- expected transition
- observed transition
- pass/fail verdict

FW-002 implementation evidence (narrow lifecycle scope):
- start/stop lifecycle behavior validated
- advertising readiness status validated
- peer connect/disconnect status callbacks validated
- lifecycle error/status surfacing validated
- explicit defer record for full notify data path to FW-003

FW-003 implementation evidence (narrow report-path scope):
- encoded report acceptance via `NotifyInputReport`
- backend report delivery invocation and success path evidence
- transport-failure surfacing evidence (`ContractStatus::kFailed` + transport fault)
- explicit defer record for callback-channel hardening to FW-004

FW-004 implementation evidence (hardening scope):
- callback-driven report-channel ready/closed behavior is integrated through backend boundary
- lifecycle/report-path failures trigger bounded recovery attempts
- repeated recovery failures force fail-closed stopped posture
- bonding material set/get/clear behavior is validated at adapter boundary (session scope)

### PROD3 — Release/Deployment Hardening Validation
Use for:
- CI/CD hardening, release controls, and deployment-readiness checks

Required checks:
- build/test/release evidence is reproducible
- artifact promotion policy is explicit
- rollback/recovery procedures are documented and validated

CI-001 implementation evidence (deployment pipeline scope):
- runtime web deployment workflow exists and is isolated from firmware build workflow
- deployment package output is deterministic and version-addressable (`current/` + `releases/<release_id>/`)
- environment targeting is explicit (`staging`/`production` dispatch + mainline production)

CI-002 implementation evidence (release integrity/provenance scope):
- firmware and runtime-web package outputs include `SHA256SUMS`
- firmware and runtime-web package outputs include `provenance.json` with run/commit metadata
- operator verification guidance for checksum/provenance validation is documented

QA-001 implementation evidence (browser automation scope):
- automated smoke/regression suite executes in headless browser against runtime `web/`
- capability state rendering and major panel-level UI regressions are covered
- documentation explicitly records unsupported automation domains (hardware serial/firmware/BLE runtime)

QA-002 implementation evidence (manual acceptance readiness scope):
- supported hardware/browser/environment matrix is explicitly defined for the current runtime/firmware surfaces
- exact scenario IDs exist for flash, monitor, config persist/load/clear, BLE behavior, validate panel, recovery states, and release verification
- required evidence schema, pass/fail row format, and regression log format are documented for human execution
- gate-level go/no-go criteria (`PG-INT`/`PG-EXT`/`PG-PROD`) and responsibility map are documented

OPS-001 implementation evidence (operations documentation scope):
- production runbooks exist for release process, deployment verification, rollback, and artifact integrity checks
- recovery procedures are documented for flashing and config transport failure modes
- BLE triage, browser support triage, escalation guidance, and known-limitation messaging are explicitly documented
- runbooks are grounded to current workflows/scripts/runtime panels in this repository

REL-001 implementation evidence (pre-production audit scope):
- explicit production-ready vs beta-grade assessment captured with concrete blocker list
- narrow CI blocker closed by requiring runtime smoke checks before deploy packaging
- remaining blockers are clearly scoped to evidence/governance closure for next rehearsal slice

REL-002 implementation evidence (final audit/handoff scope):
- final gate-by-gate production readiness report is captured with explicit ship/no-ship conclusion
- implemented vs deferred capability inventory and remaining-risk register are documented
- control-truth handoff state is updated for blocked go/no-go authorization pending closeout packet

### PROD4 — Production Readiness Audit Validation
Use for:
- final go/no-go assessment

Required checks:
- all production blockers have passing evidence
- residual risks are documented with owner and mitigation
- operations/runbook readiness is complete

## PROD-002 Production Gate Matrix (definition-level)

### Internal Beta Gate (minimum)
Gate ID: `PG-INT`

Required evidence:
- stable runtime web baseline evidence for current proven features
- firmware artifact build/publication evidence
- explicit blocker register with severity, owner, acceptance gate

Failure rule:
- Any unresolved P0 blocker without mitigation keeps internal beta gate closed.

### External Beta Gate (minimum, if used)
Gate ID: `PG-EXT`

Required evidence:
- internal beta gate pass evidence
- rollback procedure draft + execution rehearsal evidence
- manual hardware validation matrix pass for declared beta scope

Failure rule:
- Missing rollback rehearsal or failing matrix rows keep external beta gate closed.

### Production Gate (minimum)
Gate ID: `PG-PROD`

Required evidence:
- BLE production path validation evidence
- host/device config write/persist transport proof and integration evidence (if in production scope)
- CI/CD release/deployment hardening evidence
- artifact integrity/provenance evidence
- automated validation evidence
- manual hardware validation evidence
- rollback readiness evidence
- operator/support documentation completion evidence

Failure rule:
- Missing or failing mandatory evidence keeps production gate closed and production declaration disallowed.

Current gate posture at end of PROD-002:
- `PG-INT`: not yet assessed by execution evidence in this slice.
- `PG-EXT`: not yet assessed.
- `PG-PROD`: explicitly closed pending blocker clearance and mandatory evidence completion.

## Contract Approval Gate
Implementation must not begin until all items below are explicitly approved or explicitly deferred.

### Architecture Alignment
- ARCHITECTURE.md and INTERFACES.md do not conflict.
- No stable architecture truth has been replaced with implementation detail.
- Unresolved architecture choices remain unresolved in DECISIONS.md unless explicitly decided.

### Slice Readiness Approval
- `CURRENT_TASK.md` reflects exactly one active task entry.
- `TODO.md` identifies the next implementation slice as a narrow task.
- Touched files for the slice are listed before coding.
- Validation evidence required for the slice is defined before coding.

### Scope-Control Approval
- No unrelated concerns are merged into one slice.
- Blocked items are labeled explicitly as blocked.
