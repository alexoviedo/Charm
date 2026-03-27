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

### WR0 — Web Restart Control Validation
Use for:
- WR-series planning/control updates
- replacement-web boundary resets

Required checks:
- legacy web slices are explicitly marked superseded
- restart slices are explicit about implementable vs blocked scope
- firmware-protected paths are explicitly out-of-bounds
- Web Serial is recorded as primary browser/device path
- Gamepad API is recorded as primary tester path
- config write/persist is either explicitly blocked OR explicitly mapped to a repo-proven firmware transport contract with cited evidence
- no `web/`, firmware, or workflow implementation files are modified in control-only slices

### WR2 — Config Transport Contract Validation
Use for:
- transport-assessment and config transport contract readiness checks
- config import/export transport contract updates (only after proof)

Required checks:
- contract maps to existing repo interfaces (`PersistConfigRequest`, `LoadConfigResult`, `ClearConfigResult`, `ConfigStorePort`)
- status/fault mapping is explicit and lossless
- no invented payload fields beyond repo contracts
- explicit evidence review for host/device runtime transport path (serial and BLE considered separately)
- if runtime path is unproven, UI/docs remain explicitly blocked (`blocked_unproven_transport`)
- next implementation slice reflects blocked or ready truth after assessment

### WR3 — Runtime Cutover Validation
Use for:
- replacement-web cutover from staging path to active runtime path

Required checks:
- active runtime `web/` renders replacement shell correctly
- capability gating behavior remains intact after cutover
- artifact ingestion behavior remains intact after cutover
- flash/console/config-local/tester flows are unchanged in behavior
- blocked transport messaging remains explicit and truthful

### WR1 — Artifact Contract Validation
Use for:
- artifact source/ingestion decisions
- artifact bundle contract changes

Required checks:
- accepted source modes are explicit (same-site static manifest and/or manual local import)
- runtime GitHub Actions API dependence is explicitly allowed or disallowed
- minimum artifact set is explicit and repo-proven
- flash offsets are either accepted as temporary legacy contract or explicitly blocked with rationale
- no workflow/firmware/runtime-file changes in control-only artifact slices

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
