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

### D-011
- Status: accepted
- Decision: Companion web tooling remains standalone and client-side only.
- Rationale: Keeps JS/HTML complexity isolated from firmware runtime and avoids backend dependencies.
- Consequence: Webapp slices may update only webapp/control/tooling files and must not modify firmware paths.

### D-012
- Status: accepted
- Decision: Webapp restart will be executed from a clean parallel baseline; legacy runtime is disposable.
- Rationale: Avoids incremental repair risk and allows explicit cutover control.
- Consequence: Legacy `W-*` slices are superseded by restart `WR-*` slices.

### D-013
- Status: accepted
- Decision: Web Serial is the primary browser/device path for the replacement webapp.
- Rationale: Matches browser-available device IO path already proven in repo web tooling.
- Consequence: New web contracts assume Web Serial first; alternatives require explicit proof and approval.

### D-014
- Status: accepted
- Decision: Gamepad API is the primary browser-side tester/validation path.
- Rationale: Enables zero-backend in-browser validation of logical/controller behavior.
- Consequence: Validation planning for replacement app centers on Gamepad API checks.

### D-015
- Status: accepted
- Decision: Device config write/persist remains blocked until a host/device runtime transport path is proven in-repo.
- Rationale: Existing repo evidence proves internal firmware config store contracts, but not browser-to-device transport wiring.
- Consequence: Web UI must keep device upload/persist blocked and local-only config operations clearly separated.

### D-016
- Status: accepted
- Decision: Current inspected BLE adapter context does not prove a browser-usable BLE config/test path.
- Rationale: Repo evidence does not currently establish browser-facing BLE config transport for this use.
- Consequence: Web Bluetooth/BLE config testing is non-primary and blocked by default unless later proven.

### D-017
- Status: accepted
- Decision: Replacement webapp firmware ingestion supports two source modes only: (A) same-site static manifest mode and (B) manual local artifact import mode.
- Rationale: Keeps the system zero-backend and resilient when static-host artifacts are unavailable.
- Consequence: Both modes must consume the same proven artifact contract and integrity checks.

### D-018
- Status: accepted
- Decision: Runtime dependence on live GitHub Actions APIs is not allowed.
- Rationale: Prevents coupling to rate limits/auth/live CI state and preserves static-site operation.
- Consequence: Replacement webapp cannot require GitHub REST/Actions API calls for normal flashing.

### D-019
- Status: accepted
- Decision: Minimum required firmware artifact set is `manifest.json`, `bootloader.bin`, `partition-table.bin`, and `charm.bin` only.
- Rationale: These artifacts are already proven in-repo by the existing web flow and docs.
- Consequence: No new artifact types are introduced in WR-002.

### D-020
- Status: accepted
- Decision: Existing flash offsets are accepted as a documented legacy contract for now: bootloader `0x0000`, partition table `0x8000`, app `0x10000`.
- Rationale: Offsets are already the proven working baseline in current web runtime.
- Consequence: Offset-strengthening/versioned offset negotiation is deferred to a later WR slice; not a current blocker.

### D-021
- Status: accepted
- Decision: Config contract anchoring to existing repo interfaces (`ConfigStorePort`, `PersistConfigRequest`, `LoadConfigResult`, `ClearConfigResult`) is accepted for model/schema alignment only.
- Rationale: Internal contract parity is proven; host/device transport path is not.
- Consequence: Contract alignment does not by itself unblock runtime browser write/persist.

### D-022
- Status: accepted
- Decision: WR-012 assessment found no proven serial-based config protocol and no proven non-HID BLE config path for browser-to-device config write/persist.
- Rationale: Repo contains internal firmware config store contracts and a mock BLE transport adapter, but no browser-facing config command channel implementation or protocol proof.
- Consequence: Device config upload/persist remains blocked; next safe work is evidence/proof planning, not transport implementation.

### D-023
- Status: accepted
- Decision: WR-014 cutover is complete; the validated replacement webapp is now the active runtime at `web/`, and the prior legacy runtime implementation is retired.
- Rationale: Replacement shell behavior reached planned baseline and validation coverage for flasher/console/config-local/tester surfaces.
- Consequence: Runtime web changes target `web/`; `web-next/` is historical staging and may be removed in a later cleanup slice.

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
