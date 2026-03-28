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
- Production-readiness program is active.
- Runtime replacement webapp is active at `web/`.

## Durable Constraints
- Architecture-first, contract-first, validation-first, then implementation.
- Work one narrow slice at a time.
- Repo Markdown control files are persistent project memory and must remain truthful.
- Zero-backend static-web model remains in force unless explicitly changed by approved decision.
- Web Serial remains primary browser/device path unless explicitly changed by approved decision.
- Gamepad API remains primary browser-side validation path unless explicitly changed by approved decision.

## Current Production Drivers
- Firmware BLE transport path is not yet production-proven.
- Host/device config transport proof is required before runtime write/persist enablement.
- CI builds firmware artifacts, but release/deployment hardening is incomplete.
- Production validation and operations runbook readiness are not yet complete.

## Scope Discipline
- Avoid broad refactors without explicit approval.
- Keep firmware work architecture-safe and narrowly scoped.
- Do not destabilize current build path without documented rationale.
