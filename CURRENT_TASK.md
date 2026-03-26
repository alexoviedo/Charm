# CURRENT_TASK.md

## Active Task
- ID: CT-005
- Title: S-003 — Port interface declarations
- Status: active

## Goal
Declare the four external port interfaces and the minimal boundary types they require, without introducing any runtime behavior.

## In Scope
- USB host port declarations
- BLE transport port declarations
- config store port declarations
- time port declarations
- minimal shared support contracts required to declare those ports cleanly
- compile/include sanity wiring in `main`

## Out Of Scope
- adapter implementations
- supervisor, registry, parser, decoder, mapping, profile, compiler, or app logic
- tests unless absolutely required for compile validation
- runtime behavior changes
- refactors of S-001 or S-002 beyond include/dependency sanity wiring

## Assumptions
- S-001 and S-002 are merged on `main` and form the dependency base for this slice.
- `RawDescriptorRef` and `EncodedInputReport` are required support contracts for clean port declarations and can be introduced as a small shared support header in this slice.
- Port-specific boundary types may be co-located with their port headers in this slice to avoid widening the scope into unrelated modules.

## Dependencies
- merged S-001 PR
- merged S-002 PR
- `INTERFACES.md`
- `VALIDATION.md`
- `MEMORY.md`
- no unresolved architecture decision blocks S-003

## Touched Files
- `components/charm_contracts/include/charm/contracts/transport_types.hpp` — minimal shared support contracts for ports
- `components/charm_ports/CMakeLists.txt` — header-only `charm_ports` component registration
- `components/charm_ports/include/charm/ports/usb_host_port.hpp` — USB host port declarations and boundary types
- `components/charm_ports/include/charm/ports/ble_transport_port.hpp` — BLE transport port declarations and boundary types
- `components/charm_ports/include/charm/ports/config_store_port.hpp` — config store port declarations and boundary types
- `components/charm_ports/include/charm/ports/time_port.hpp` — time port declarations and boundary types
- `main/CMakeLists.txt` — add `charm_ports` dependency for compile/include sanity only
- `main/main.cpp` — include new port headers for sanity only
- `CURRENT_TASK.md` — active slice update and actual validation/rollback notes
- `TODO.md` — implementation queue bookkeeping for S-002/S-003
- `CHANGELOG_AI.md` — change log entry for S-003

## Risks
- port-local boundary types could tempt later slices to backfill too much behavior into the port headers
- port headers could accidentally leak platform-native SDK types if later edits are not disciplined
- the slice could expand into adapter implementation work if not kept narrow

## Validation Plan
- V1 review against `INTERFACES.md`
- compile-only validation for the new `charm_ports` component
- include-path sanity check through `main/main.cpp`
- forbidden-dependency spot check to ensure no ESP-IDF, BLE stack, or storage SDK headers leak through the port interfaces

## Rollback Plan
- revert the S-003 PR to remove only the header-only port component, the minimal shared support header, the main include wiring, and control-file bookkeeping
- no later slice should be based on the branch until S-003 is reviewed and merged

## Acceptance Gates
- only the files required for S-003 are touched
- all four port interfaces are declared with approved boundary methods only
- no adapter implementation details appear in port headers
- no platform SDK types leak through the ports
- validation remains contract review plus compile-only/include-path sanity checks
- rollback remains low-cost

## Stop Condition
Stop after S-003 is implemented and submitted as a PR against `main`.
