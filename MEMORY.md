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

## Project Constraints
- This repo is controlled by architecture-first development.
- No implementation begins before relevant contracts/interfaces are approved.
- Work proceeds one narrow slice at a time.
- Validation criteria are defined before implementation.
- Broad refactors require explicit Tech Lead approval.
- Repo Markdown control files are persistent project memory.
- Implementation slice planning is stored in `IMPLEMENTATION_SLICES.md`.
- Firmware code/config/interfaces/transport behavior are out of scope for web restart slices.
- Protected firmware paths remain untouched during web restart work:
  - `components/**`
  - `main/**`
  - `tests/**`
  - root `CMakeLists.txt`
  - firmware-related `.github/workflows/**`

## Webapp Restart Facts (WR track)
- Legacy `web/` runtime is disposable and superseded for planning purposes.
- Replacement webapp must be built in a parallel path first (planned as `web-next/`) and cut over later by explicit slice.
- The replacement remains zero-backend and client-side only.
- Web Serial is the primary browser/device integration path.
- Gamepad API is the primary browser-side tester/validation path.
- Device config write/persist flows are blocked unless a repo-proven firmware transport contract exists.
- The currently inspected BLE adapter context does not prove a browser-usable BLE config/test path.

## Working Rules for This Chat
- Do not invent requirements beyond approved architecture and Tech Lead direction.
- Do not merge unrelated concerns into one task.
- For every task: define scope, assumptions, dependencies, risks, touched files, and validation before code.
- If a task grows too large, split it instead of proceeding.
- End each work segment with a clean handoff and next safe step.

## What Not To Store Here
- Temporary brainstorms
- Raw debugging notes
- Unapproved ideas
- Implementation details
- Duplicate architecture text
- Session-private reasoning
