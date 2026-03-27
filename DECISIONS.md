# DECISIONS.md

## Purpose
Record accepted, rejected, and unresolved decisions.
Only approved decisions belong in accepted/rejected sections.

---

## Accepted Decisions

### D-001
- Status: accepted
- Decision: Use a ports-and-adapters architecture with a platform-agnostic core.
- Rationale: Allows USB/BLE implementation changes without rewriting core translation logic.
- Consequence: Core logic must not depend on ESP-IDF, USB stack, or BLE stack internals.

### D-002
- Status: accepted
- Decision: Separate the system into a real-time data plane and a control plane.
- Rationale: Preserves deterministic hot-path behavior and isolates asynchronous lifecycle work.
- Consequence: Control-plane events and raw report handling must remain separate.

### D-003
- Status: accepted
- Decision: Mapping engine output is canonical LogicalGamepadState only.
- Rationale: Prevents transport coupling and preserves profile independence.
- Consequence: BLE report packing is confined to profile manager/report encoder.

### D-004
- Status: accepted
- Decision: Persisted mappings use stable semantic HID identity.
- Rationale: Mappings must survive parser and firmware evolution.
- Consequence: ElementKey / ElementKeyHash is the persistence identity, not parser order.

### D-005
- Status: accepted
- Decision: USB teardown is serialized through the adapter context.
- Rationale: Prevents unsafe callback-driven teardown and resource races.
- Consequence: Callbacks may enqueue intent/events only.

### D-006
- Status: accepted
- Decision: Development in this repo is contract-first, then validation-first, then implementation.
- Rationale: Reduces regressions, context drift, and spaghetti code.
- Consequence: No coding begins before relevant contracts and validation are approved.

### D-007
- Status: accepted
- Decision: Work proceeds one narrow slice at a time.
- Rationale: Keeps blast radius small and reviewable.
- Consequence: Large tasks must be split before execution.

### D-008
- Status: accepted
- Decision: Repo Markdown control files are persistent project memory.
- Rationale: Future sessions need stable repo-local context.
- Consequence: Control files must be kept current and disciplined.

### D-009
- Status: accepted
- Decision: Native x86 unit tests and ESP-IDF cross-compiled firmware builds will be separated into distinct CI jobs/stages.
- Rationale: Core tests remain platform-agnostic and do not need the overhead or environment constraints of the ESP-IDF toolchain.
- Consequence: Unit tests will run on a standard Ubuntu runner with `cmake` and `libgtest-dev`.

### D-010
- Status: accepted
- Decision: Use `espressif/esp-idf-ci-action` for the firmware build step.
- Rationale: Simplifies execution within the official Espressif Docker environment.
- Consequence: The CI workflow will not manually maintain an ESP-IDF environment using the installer action.

---

## Rejected Options

### R-001
- Status: rejected
- Option: Persist mappings by parser-local numeric ordering.
- Reason Rejected: Unstable across descriptor handling changes.

### R-002
- Status: rejected
- Option: Let the mapping engine write profile-specific BLE report layouts.
- Reason Rejected: Violates translation/transport separation.

### R-003
- Status: rejected
- Option: Perform direct USB close/free/teardown work inside callbacks.
- Reason Rejected: Violates serialized teardown rule and increases race risk.

### R-004
- Status: rejected
- Option: Allow ESP-IDF types inside the core translation domain.
- Reason Rejected: Breaks platform-agnostic core boundary.

### R-005
- Status: rejected
- Option: Perform broad refactors without explicit Tech Lead authorization.
- Reason Rejected: Increases regression risk and scope drift.

---

## Unresolved Decisions

### U-001
- Status: unresolved
- Decision Needed: Canonical BLE adapter scope
- Options: NimBLE / Bluedroid / both
- Impact: Adapter work, persistence details, validation surface

### U-002
- Status: accepted
- Decision Needed: Initial supported output profile set
- Options: single profile first / multiple selectable profiles
- Impact: Encoder contract and validation scope
- Decision: single profile first (Generic Gamepad)

### U-003
- Status: accepted
- Decision Needed: Config compiler placement
- Options: on-device / companion web app / both
- Impact: Config workflow and persistence boundaries
- Decision: Companion web app

### D-011
- Status: accepted
- Decision: Implement a standalone Web Serial Flasher & Config Compiler in `web/`.
- Rationale: Isolates JS/HTML complexity from the ESP-IDF C++ data plane and provides a zero-install tool for firmware updates.
- Consequence: Must exist entirely outside the core translation domain and build flow.

### D-012
- Status: accepted
- Decision: The web app will be a static site, downloading firmware artifacts via static relative HTTP paths (e.g., from `gh-pages`), and requires no user accounts or cloud backend.
- Rationale: Avoids credential leakage (GitHub PATs), removes dynamic CI-fetching rate limits, and satisfies the "no backend dependencies for MVP" rule.
- Consequence: CI/CD must be responsible for organizing and publishing `.bin` artifacts alongside the static site HTML/JS.

### U-004
- Status: unresolved
- Decision Needed: Need and timing for OutputStateQueue
- Options: include now / defer
- Impact: tasking shape and queue boundaries

### U-005
- Status: unresolved
- Decision Needed: Queue sizes and memory budget
- Options: TBD
- Impact: deterministic behavior guarantees

### U-006
- Status: unresolved
- Decision Needed: Persisted config schema/versioning/hash details
- Options: TBD
- Impact: compatibility and migration behavior

### U-007
- Status: unresolved
- Decision Needed: Interface claim policy details
- Options: TBD
- Impact: enumeration behavior and composite device handling

### U-008
- Status: unresolved
- Decision Needed: Actual runtime task model
- Options: follow reference task model exactly / vary while preserving boundaries
- Impact: adapter wiring and scheduling

## Update Rule
Move an item from unresolved to accepted/rejected only after explicit approval.
