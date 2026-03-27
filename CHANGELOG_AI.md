# Changelog (AI)

## [Unreleased]
### Added
- Executed `WR-014 — Cutover and legacy web removal`.

### Changed
- Replaced legacy runtime `web/` implementation with the validated replacement implementation formerly staged in `web-next/`.
- Runtime truth updated: replacement shell is now the active runtime webapp at `web/`.
- Updated control tracking: WR-014 done and WR-015 blocked.

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
