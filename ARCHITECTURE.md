# ARCHITECTURE.md

## Status
- State: active
- Scope: stable architectural truth only
- Excludes: backlog, implementation details, temporary notes, unresolved choices

## System Goal
Bridge one or more USB HID input devices to a BLE HID gamepad output on ESP32-S3 while preserving:
- platform-agnostic core logic
- strict separation of translation and transport
- deterministic real-time behavior in the data path
- testability without physical hardware
- contributor-friendly modularity

## Top-Level Layers
1. Core domain
   - Pure logic
   - No ESP-IDF, USB stack, or BLE stack types
2. Port interfaces
   - USB host port
   - BLE transport port
   - Config store port
   - Time port
3. Platform adapters
   - ESP32-S3-specific implementations behind the ports

## Major Architectural Components
- Supervisor / mode state machine
- Control-plane event model
- Raw report pipeline
- Device registry
- HID descriptor parser
- HID report decoder
- Stable HID element identity model
- Mapping engine
- Logical gamepad state
- Profile manager / report encoder
- Config compiler
- Config store
- USB host adapter
- BLE transport adapter
- Time adapter

## Module Boundaries
- Supervisor coordinates lifecycle and mode transitions only
- Parser/decoder convert descriptors and reports into canonical events
- Mapping engine transforms canonical input events into canonical logical gamepad state
- Profile encoder converts logical gamepad state into profile-specific report bytes
- USB and BLE adapters are replaceable behind port contracts
- Config work is isolated from the run-time data path

## Primary Data Flow
1. USB HID device(s) connect
2. USB host enumerates devices/interfaces
3. Raw HID reports are received
4. HID descriptors are parsed into deterministic decode structures
5. Reports are decoded into canonical input element events
6. Mapping engine updates canonical logical gamepad state
7. Profile encoder packs logical state into output-profile report bytes
8. BLE transport publishes HID-over-GATT reports
9. Supervisor manages mode, recovery, and config activation around the pipeline

## Operational Modes
- Configuration mode
- Run mode
- Recovery state around run mode

## External Integrations
- USB HID devices, including hub-attached devices
- ESP-IDF USB host
- External hub support
- BLE HID-over-GATT host devices
- NimBLE and/or Bluedroid behind the BLE transport port
- NVS behind the config store port
- Optional companion web application for config compilation

## Hard Constraints
- Core translation logic must remain platform-agnostic
- Data plane must use bounded, deterministic processing
- Hot paths must use fixed-size/preallocated structures
- Mapping engine must be unit-testable without USB, BLE, or ESP32 hardware
- Mapping engine outputs only canonical logical gamepad state
- Persisted mappings must use stable semantic HID identity
- USB teardown must be serialized through the adapter context
- Configuration activity must not interfere with the run-time data path

## Stable Identity Rule
Persisted mappings must reference stable semantic HID identity:
- ElementKey
- or stable ElementKeyHash

Persisted mappings must never depend on parser-local numbering or transient field order.

## Non-Coupling Rules
- No ESP-IDF types in the core domain
- No BLE report packing in the mapping engine
- No parser-index-based persisted mappings
- No direct USB teardown from callbacks
- No configuration logic embedded in the hot data path

## Extensibility Rules
- New USB stack: implement the USB host port
- New BLE stack: implement the BLE transport port
- New mapping transform: add in mapping/compiler path
- New output profile: add in profile manager/report encoder path

## Reference Task Model
Reference only; not mandatory:
- usb_adapter_task
- hid_decode_task
- mapping_task
- ble_task
- config_task

Any implementation may vary in tasking as long as architectural boundaries and ownership rules remain intact.

## Change Policy
Update this file only when stable architecture changes.
Do not place unresolved decisions here; record them in DECISIONS.md.
