# MEMORY.md

## Purpose
Persistent project memory for future ChatGPT sessions.
Store durable facts, constraints, and working rules that should survive session boundaries.

## Source-of-Truth Order
1. Approved Tech Lead instruction
2. ARCHITECTURE.md
3. DECISIONS.md
4. INTERFACES.md
5. CURRENT_TASK.md
6. IMPLEMENTATION_SLICES.md
7. TODO.md
8. VALIDATION.md
9. CHANGELOG_AI.md

## Program State (current)
- Webapp-restart program is complete as historical truth.
- Prior production-tracking program (`PROD-*` through `REL-*`) is preserved as historical truth.
- Active execution program is the vertical-slice program (`VS-01`..`VS-08`) tied to verified implementation gaps G-001..G-006.
- Runtime replacement webapp is active at `web/`.

## Durable Constraints
- Architecture-first, contract-first, validation-first, then implementation.
- Work one narrow slice at a time.
- Repo Markdown control files are persistent project memory and must remain truthful.
- Zero-backend static-web model remains in force unless explicitly changed by approved decision.
- Web Serial remains primary browser/device path unless explicitly changed by approved decision.
- Gamepad API remains primary browser-side validation path unless explicitly changed by approved decision.

## Current Production Drivers
- Close verified implementation gaps in order via vertical slices:
  - G-001 runtime data-plane wiring
  - G-003 config transport adapter wiring
  - G-002 BLE callback hardening
  - G-004 NVS startup lifecycle
  - G-005 host test portability
  - G-006 web runtime consolidation
- Preserve historical audit/risk artifacts while keeping active control posture aligned to code truth.

## Scope Discipline
- Avoid broad refactors without explicit approval.
- Keep firmware work architecture-safe and narrowly scoped.
- Do not destabilize current build path without documented rationale.
