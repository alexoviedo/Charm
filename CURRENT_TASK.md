# CURRENT_TASK.md

## Active Task
- ID: VS-01
- Title: Runtime Data Plane Integration
- Status: in_progress

## Goal
Execute the first production vertical slice by wiring the firmware runtime USB input path through decode/mapping/profile encode into BLE notify, while preserving ports/adapters boundaries and deterministic core behavior.

## Why this is active now
- `VS-PROG-001` reset control posture from prior production-tracking program into a gap-driven vertical-slice execution program.
- Code-first audit still shows open implementation gaps G-001..G-006 and they are now the authoritative execution drivers.

## Entry Facts (must remain true)
- Runtime replacement webapp remains active at `web/`.
- `web-next/` still exists and is treated as drift risk until consolidated (`VS-06`).
- Config transport command semantics exist in firmware service layer, but runtime transport integration remains a dedicated slice.
- Previous PROD/FW/CFG/WEB/CI/QA/OPS/REL program history is preserved as historical record.

## Exit Criteria for VS-01
- App runtime demonstrates USB report intake -> decode/mapping/logical state -> profile encode -> BLE notify dispatch path.
- Negative-path behavior for malformed/unsupported input remains deterministic and fail-safe.
- Evidence is recorded in validation docs and any newly discovered blockers are explicitly documented.
