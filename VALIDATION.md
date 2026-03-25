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
- dependency rules
- error categories

Required checks:
- no platform leakage into core contracts
- no transport/translation coupling
- invariants stated clearly
- unresolved items called out explicitly
- allowed and forbidden dependency rules are explicit
- persistence boundaries are stated without inventing backend details

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

## CONTRACT APPROVAL GATE
Implementation must not begin until all items below are explicitly approved or explicitly deferred.

### Architecture Alignment
- ARCHITECTURE.md and INTERFACES.md do not conflict
- No stable architecture truth has been replaced with implementation detail
- Unresolved architecture choices remain unresolved in DECISIONS.md unless explicitly decided

### Contract Inventory Approval
- Each major module has an approved public interface boundary
- Shared data contracts are approved
- Request/response shapes are approved at boundary level
- Event/message shapes are approved at boundary level
- Persistence boundaries are approved
- External adapter boundaries are approved
- Boundary-level error categories are approved
- Cross-cutting invariants are approved

### Dependency Approval
- Allowed module dependencies are approved
- Forbidden module dependencies are approved
- Required isolation boundaries are approved

### Decision / Ambiguity Approval
- Required pre-implementation decisions are either:
  - explicitly decided, or
  - explicitly deferred with no blocking impact on the first slice
- The first slice does not silently assume unresolved decisions

### Slice Readiness Approval
- CURRENT_TASK.md reflects exactly one active slice
- TODO.md identifies the next implementation slice as a narrow task
- Touched files for the first implementation slice are listed before coding
- Validation evidence required for the first implementation slice is defined before coding

### Scope-Control Approval
- No unrelated concerns have been merged into the first implementation slice
- No broad refactor is implied by the first implementation slice
- No product documentation work is mixed into the first implementation slice

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
Current slice type: V1 — Contract / Interface Slice

Current acceptance checks:
- contract inventory is complete at the module boundary level
- dependency map is explicit
- boundary-level error categories are explicit
- CONTRACT APPROVAL GATE is present
- no application code
- no tests
- no pseudocode
- no implementation logic
