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

### D-024
- Status: accepted
- Decision: WR-015 must define and pass a serial control/config transport proof matrix before any runtime device config write/persist implementation is allowed.
- Rationale: Existing repo evidence proves schema alignment and local web config tooling, but does not prove a host/device runtime transport channel.
- Consequence: Protocol framing, command semantics, status/fault mapping, host harness criteria, and pass/fail evidence are now explicit approval gates.

### D-025
- Status: accepted
- Decision: The restart-track (WR) program is complete and transitions to a production-readiness (PROD) program without losing WR history.
- Rationale: Replacement runtime cutover and restart deliverables are complete; remaining risks are productionization and readiness gates.
- Consequence: Active planning and execution use `PROD-*` slices while WR history remains archived and truthful.

### D-026
- Status: accepted
- Decision: Production program drivers are explicitly prioritized as: BLE productionization, host/device config transport proof, web integration of proven transport, CI/CD hardening, validation/runbook readiness, and final production audit.
- Rationale: Current blocker set spans transport, release discipline, and operational readiness rather than restart-shell implementation.
- Consequence: `PROD-002` establishes blocker baselines and acceptance gates before implementation slices proceed.

### D-027
- Status: accepted
- Decision: Production readiness is gated by explicit minimum conditions for internal beta, external beta (optional), and production release.
- Rationale: The repo has working pre-production surfaces, but production declaration requires objective release gates and evidence.
- Consequence:
  - Internal beta minimum:
    - runtime web remains stable at `web/` with current flashing/console/local-config/tester behavior
    - firmware artifacts are reproducibly built and published for operator flashing
    - known critical blockers are explicitly documented and triaged
  - External beta minimum (if used):
    - internal beta gates pass
    - rollback path and support/runbook draft exists
    - manual hardware validation set passes for targeted test matrix
  - Production minimum:
    - real BLE output path is production-proven (non-mock behavior)
    - real host/device config write/persist path is production-proven if production scope includes runtime config persistence
    - runtime web integration for proven transport is complete and fail-safe
    - CI/CD release and deployment hardening gates pass
    - artifact integrity/provenance expectations pass
    - automated and manual validation gates pass
    - rollback readiness is validated
    - operator/support documentation is complete and versioned

### D-028
- Status: accepted
- Decision: Production declaration is blocked until mandatory capabilities and evidence gates are satisfied.
- Rationale: Prevents optimistic release claims unsupported by repository evidence.
- Consequence:
  - Mandatory production capabilities:
    - production-safe BLE output transport
    - production-safe host/device config transport where required by scope
    - hardened release/deployment pipeline with rollback controls
    - automated validation coverage and manual hardware validation evidence
    - operator/support runbook readiness
  - Required evidence before declaring production-ready:
    - transport proof reports (positive/negative/recovery)
    - BLE production validation evidence
    - CI/CD/release hardening evidence (including promotion/rollback checks)
    - artifact integrity/provenance evidence
    - manual hardware matrix results
    - support/runbook completion evidence
  - Current blockers to clear before production:
    - BLE path not yet production-proven
    - host/device config write/persist path not yet production-proven
    - release/deployment hardening not yet complete
    - full automated/manual validation and operations readiness not yet complete

### D-029
- Status: accepted
- Decision: Production-readiness gates are formalized as `PG-INT` (internal beta), `PG-EXT` (external beta, optional), and `PG-PROD` (production).
- Rationale: A named gate model keeps planning/test evidence consistent across control files and avoids ambiguous release claims.
- Consequence:
  - `PG-INT` must prove stable currently-supported runtime capabilities plus repeatable firmware artifact build/publish evidence and explicit blocker tracking.
  - `PG-EXT` (if used) requires `PG-INT` pass plus rollback rehearsal evidence and scoped manual hardware validation pass.
  - `PG-PROD` requires all mandatory production capabilities and evidence gates from D-027/D-028, with no open mandatory blockers.

### D-030
- Status: accepted
- Decision: FW-001 is a contract/validation slice only and must be complete before FW-002 firmware BLE implementation starts.
- Rationale: BLE is a critical production blocker; behavior/failure/evidence criteria must be explicit before implementation.
- Consequence:
  - FW-001 completion requires BLE lifecycle model, failure taxonomy, and acceptance matrix in control docs.
  - FW-002 scope is constrained to implementing FW-001-defined behavior and evidence expectations.

### D-031
- Status: accepted
- Decision: FW-002 scope is complete with lifecycle implementation only; full BLE report-notify data path is explicitly deferred to FW-003.
- Rationale: Preserves narrow-slice safety while replacing non-production lifecycle behavior with stack-backed lifecycle behavior.
- Consequence:
  - FW-002 completion does not claim full BLE data-path completeness.
  - FW-003 is the next required firmware slice for report-notify path.

### D-032
- Status: accepted
- Decision: FW-003 scope is complete with adapter-to-backend report delivery and transport failure surfacing; callback-channel hardening is deferred to FW-004.
- Rationale: Keeps FW-003 focused on report-path implementation without expanding into callback plumbing and recovery hardening breadth.
- Consequence:
  - FW-003 completion claims report-path implementation behind approved BLE boundary.
  - FW-004 is required before production-readiness claims on BLE report-path robustness.

### D-033
- Status: accepted
- Decision: FW-004 completes callback-channel hardening with bounded adapter recovery and fail-closed fallback, while bonding material remains session-scoped in this slice.
- Rationale: Recovery hardening is required for BLE report-path robustness, but persistence wiring must remain out of FW-004 to preserve slice boundaries.
- Consequence:
  - BLE adapter now owns bounded lifecycle/report recovery behavior and explicit terminal stopped posture on repeated recovery failure.
  - Bonding material set/get/clear exists at adapter boundary only; persistence integration is deferred to transport/config slices.

### D-034
- Status: accepted
- Decision: `CFG-001` freezes the first production host/device config transport path as serial-primary only, with BLE config transport deferred.
- Rationale: Existing repo proof posture prioritizes one narrow executable path; introducing multiple first-class transports increases implementation and validation surface without first-slice necessity.
- Consequence:
  - `config.persist`, `config.load`, `config.clear`, and `config.get_capabilities` are the v1 command-level contract surface.
  - Request/response envelopes must preserve protocol version, request id, status/fault fidelity, and integrity metadata.
  - Runtime config write/persist remains blocked until `CFG-002` protocol spec/harness alignment is approved.

### D-035
- Status: accepted
- Decision: `CFG-002` implements a narrow firmware-side config transport service over the frozen serial-primary contract, without introducing BLE config transport or web runtime changes.
- Rationale: Small-slice implementation reduces risk while creating the minimum firmware endpoint needed for later runtime integration.
- Consequence:
  - Firmware now exposes command handling for `config.persist/load/clear/get_capabilities` through a contract-level service.
  - Envelope checks are enforced for version, request id, and integrity prior to command dispatch.
  - `WEB-001` is the next required slice for end-to-end browser/runtime use.

### D-036
- Status: accepted
- Decision: `WEB-001` enables runtime web config transport over the approved serial-first path and removes the prior blocked_unproven_transport UI posture.
- Rationale: Firmware-side transport path now exists; web must reflect truthful support while preserving ownership and fail-closed behavior.
- Consequence:
  - Web config panel can call `config.get_capabilities`, `config.persist`, `config.load`, and `config.clear`.
  - Config transport calls require serial permission + flash owner and remain blocked during flash/console activity.
  - `WEB-002` is required next for protocol hardening and end-to-end evidence capture.

### D-037
- Status: accepted
- Decision: `WEB-002` is a UX-hardening-only slice that improves state clarity/recovery/operator guidance across flash, monitor, config, and tester surfaces without adding new features.
- Rationale: Production-grade operator use requires consistent status semantics and actionable recovery text before further expansion.
- Consequence:
  - Runtime web surfaces now expose clearer blocked/ready/error transitions and disabled-state reasons.
  - CI/CD hardening (`CI-001`) is next active blocker slice.

### D-038
- Status: accepted
- Decision: `CI-001` uses a dedicated runtime-web deployment workflow (`web_runtime_deploy.yml`) with separate packaging/deploy steps and explicit separation from firmware build artifact generation.
- Rationale: Web runtime deployment needs production-grade controls without destabilizing firmware build behavior.
- Consequence:
  - Runtime web deployment pipeline is isolated from `firmware_build.yml`.
  - Deploy package includes versioned release snapshots for rollback-aware redeploy (`releases/<release_id>/`) and stable `current/` path.
  - `CI-002` is the next slice for promotion controls and rollback rehearsal evidence.

### D-039
- Status: accepted
- Decision: `CI-002` introduces additive integrity/provenance hardening by emitting `SHA256SUMS` and `provenance.json` for firmware and runtime-web release packages.
- Rationale: Production-grade release management requires artifact verification and traceability without redesigning deployment architecture.
- Consequence:
  - Release outputs now carry checksum and provenance metadata in both relevant pipelines.
  - Operator verification commands/checklists are documented for release handling.
  - `QA-001` is the next slice for verification evidence pack and release gate rehearsal.

### D-040
- Status: accepted
- Decision: `QA-001` uses Playwright smoke/regression automation for browser-side runtime checks and explicitly excludes claims about hardware serial/firmware/BLE outcomes.
- Rationale: Reliable automated web regression coverage is high-value, but hardware-dependent outcomes must remain manual evidence domains.
- Consequence:
  - Runtime shell/capability/panel truth-state regressions are now machine-checked.
  - `QA-002` is required next for hardware-attached matrix and runbook rehearsal evidence.


### D-041
- Status: accepted
- Decision: `QA-002` standardizes a repository-grounded manual hardware acceptance matrix with explicit scenario IDs, evidence schema, regression logging format, and gate-linked go/no-go criteria.
- Rationale: Production confidence for serial/flash/BLE/deployment behavior requires repeatable human evidence beyond browser automation.
- Consequence:
  - Operator/reviewer evidence is comparable across runs and environments.
  - `OPS-001` can now execute against a concrete matrix instead of ad-hoc checklists.

---

### D-042
- Status: accepted
- Decision: `OPS-001` defines repository-grounded operations runbooks as mandatory launch artifacts (release, rollback, recovery, triage, integrity, escalation, and limitation messaging).
- Rationale: Production readiness requires operator-executable procedures tied to real workflows and runtime controls, not ad-hoc tribal knowledge.
- Consequence:
  - Launch/maintenance support now has repeatable, evidence-linked procedures.
  - `REL-001` is the next active slice to execute rehearsal and consolidate gate evidence.

---

### D-043
- Status: accepted
- Decision: Runtime web deployment must execute Playwright smoke checks before packaging/deploy in `web_runtime_deploy.yml`.
- Rationale: A production deployment path without regression checks risks shipping known-broken runtime UI/control behavior.
- Consequence:
  - Deploy pipeline now fails fast when smoke baseline regresses.
  - Remaining production blockers are primarily hardware-evidence and governance closure items.

---

### D-044
- Status: accepted
- Decision: Final REL-002 audit result is `do-not-ship` for production until closeout evidence packet and named approvals are completed.
- Rationale: Gate controls require hardware evidence and governance sign-off, and those are still incomplete despite strong engineering baseline.
- Consequence:
  - Production declaration remains blocked.
  - Next owners must execute closeout packet before go/no-go authorization.

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
