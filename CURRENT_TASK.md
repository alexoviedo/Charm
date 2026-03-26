# CURRENT_TASK.md

## Active Task
- ID: CT-009
- Title: S-007 — Test-support foundation for pure-core modules
- Status: active

## Goal
Add the minimum header-only test-support layer required to unit-test pure-core modules against port contracts without binding tests to real adapters.

## In Scope
- `charm_test_support` header-only component registration
- fake port implementations for time, config-store, USB-host, and BLE-transport ports
- minimal unit-test CMake placeholder for future test targets

## Out Of Scope
- production runtime implementations
- adapter implementations
- pure-core behavior implementations
- integration or hardware tests
- refactors outside minimum test-support wiring

## Assumptions
- S-003 port contracts are stable enough to implement simple fake adapters for tests.
- S-004 through S-006 declaration surfaces can consume test fakes in later slices without production coupling.
- unresolved architecture decisions do not block header-only test-support contracts.

## Dependencies
- merged S-003 PR
- merged S-004 PR
- merged S-005 PR
- merged S-006 PR
- `INTERFACES.md`
- `VALIDATION.md`
- `MEMORY.md`

## Touched Files
- `components/charm_test_support/CMakeLists.txt` — register header-only test-support component
- `components/charm_test_support/include/charm/test_support/fake_time_port.hpp` — fake monotonic time port
- `components/charm_test_support/include/charm/test_support/fake_config_store_port.hpp` — fake config-store port
- `components/charm_test_support/include/charm/test_support/fake_usb_host_port.hpp` — fake USB-host port
- `components/charm_test_support/include/charm/test_support/fake_ble_transport_port.hpp` — fake BLE-transport port
- `tests/unit/CMakeLists.txt` — placeholder test-target root for later unit slices
- `CURRENT_TASK.md` — active slice update and validation/rollback notes
- `TODO.md` — implementation queue bookkeeping for S-006/S-007
- `CHANGELOG_AI.md` — change log entry for S-007

## Risks
- fake adapters could drift from port signatures if later contract changes are made without synchronized test-support updates
- convenience helper methods in fakes must remain test-only and never leak into production components
- placeholder unit CMake can become stale if later test-target wiring is not updated in lockstep

## Validation Plan
- V2 compile validation for header-only fake port contracts
- fake-to-port conformance spot-check against S-003 headers
- include-path sanity compile for fake headers

## Rollback Plan
- revert the S-007 PR to remove only `charm_test_support`, `tests/unit/CMakeLists.txt`, and control-file bookkeeping
- no behavior or adapter runtime rollback complexity expected

## Acceptance Gates
- test-support declarations satisfy existing port interfaces
- no production behavior is introduced
- no platform SDK types leak through test-support surfaces
- scope remains limited to S-007 files only

## Stop Condition
Stop after S-007 is implemented and submitted as a PR against `main`.
