# CURRENT_TASK.md

## Active Task
- ID: CT-002
- Title: Complete contract-first implementation boundary definition
- Status: active

## Goal
Define the complete implementation boundary before any logic is written.

## In Scope
- Contract inventory grouped by module
- Dependency map
- Risk map
- Contract approval gate
- Documentation-only updates to repo control files

## Out Of Scope
- Application code
- Tests
- Pseudocode
- Algorithms
- File layout refactors
- Runtime behavior changes
- Dependency changes

## Assumptions
- The merged repo control scaffolding on `main` is authoritative.
- The architecture document remains the source of stable system truth.
- This slice is documentation-only and contract-first.

## Dependencies
- ARCHITECTURE.md
- MEMORY.md
- DECISIONS.md
- INTERFACES.md
- TODO.md
- Tech Lead review of this contract pass

## Touched Files
- INTERFACES.md — add complete contract inventory, dependency map, and boundary-level error categories
- VALIDATION.md — add CONTRACT APPROVAL GATE
- TODO.md — reflect contract-pass backlog state
- CURRENT_TASK.md — switch to the active contract-first slice
- CHANGELOG_AI.md — record AI-made documentation changes

## Risk Map

### Likely Regression Points
- Stable HID identity drifting from semantic identity to parser-local numbering
- Mapping/transport coupling re-entering through profile-specific state fields
- USB callback responsibilities expanding into teardown or business logic
- Control-plane events becoming mixed with raw data-plane ownership
- Persistence contracts accidentally capturing transient runtime handles
- Adapter-native SDK types leaking into shared/core contracts
- Supervisor absorbing mapping, parsing, or packing responsibilities
- Durable schema decisions being implied before explicit approval

### Likely Ambiguity Points
- Canonical BLE adapter scope
- Initial supported output profile set
- Config compiler placement
- Queue depth and memory-budget decisions
- Interface claim policy specifics
- Runtime task-model specifics
- Exact normalization surface for canonical logical gamepad state
- Exact persistence versioning and integrity metadata

### Likely AI Overreach Points
- Writing implementation types and logic while defining contracts
- Inventing concrete schema fields that require unresolved decisions
- Defining adapter internals instead of adapter boundaries
- Collapsing multiple future implementation slices into one “starter framework”
- Adding tests, stubs, or pseudocode not requested in this pass
- Backfilling architecture changes that were not approved
- Touching product docs or repo layout without explicit authorization

## Acceptance Gates
- Contract inventory is grouped by module and complete at the boundary level
- Dependency map lists allowed dependencies, forbidden dependencies, and isolation boundaries
- Risk map captures regression, ambiguity, and AI-overreach risks
- VALIDATION.md contains a CONTRACT APPROVAL GATE
- No application code, tests, pseudocode, or algorithms are introduced
- Exactly one active task remains in this file

## Stop Condition
Stop after the contract-first pass is documented and submitted as a PR against `main`.
