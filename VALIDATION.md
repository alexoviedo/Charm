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
- exactly one active task in CURRENT_TASK.md

### V1 — Contract / Interface Slice
Use for:
- interface definitions
- event shapes
- schema boundaries
- invariants

Required checks:
- no platform leakage into core contracts
- no transport/translation coupling
- invariants stated clearly
- unresolved items called out explicitly

### V2 — Unit Validation Slice
Use for:
- pure core logic
- mapping behavior
- schema/validation logic

Required checks:
- deterministic inputs/outputs
- no hardware dependency
- regression cases identified
- changed contracts reflected in INTERFACES.md and DECISIONS.md if needed

### V3 — Integration Validation Slice
Use for:
- adapter wiring
- queue boundaries
- persistence wiring
- supervisor interactions

Required checks:
- module boundary adherence
- lifecycle correctness
- error/fault path coverage
- no forbidden cross-layer coupling

### V4 — Hardware / Manual Validation Slice
Use for:
- USB device behavior
- BLE behavior
- end-to-end firmware behavior

Required checks:
- exact hardware/setup listed
- expected outcome listed
- actual outcome recorded
- regressions and anomalies captured

## Required Evidence Per Slice
Every completed slice must record:
- slice id/title
- scope
- touched files
- contracts affected
- validation level(s) used
- checks performed
- result
- known gaps
- next safe step

## Approval Gates
A slice is not complete unless:
- scope stayed narrow
- validation evidence exists
- unresolved issues are explicit
- no unrelated concerns were merged
- handoff state is recorded

## Red Flags
Stop and split the task if any of these occur:
- more files need to change than originally scoped
- contract changes spread into multiple unrelated modules
- validation surface expands unexpectedly
- unresolved architecture decisions block safe progress

## Current Default For This Slice
Current slice type: V0 — Documentation / Control Slice

Current acceptance checks:
- eight repo control files defined
- no application code
- no tests
- no implementation logic
- architecture captured as stable truth only
- decisions separated into accepted/rejected/unresolved
- interfaces remain high-level and contract-only
