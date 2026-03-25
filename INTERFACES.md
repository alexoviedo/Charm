# INTERFACES.md

## Purpose
Define high-level module boundaries, contracts, data shapes, and invariants.
This file is interface-only. No implementation logic belongs here.

## Boundary Map
- Core domain
  - event model
  - HID semantic identity
  - decoder outputs
  - mapping engine contract
  - logical gamepad state
  - profile encoder contract
- Port interfaces
  - USB host port
  - BLE transport port
  - config store port
  - time port
- Platform adapters
  - ESP32-S3-specific implementations behind the ports

## Core Data Shapes

### ElementKey
Stable semantic identity for a physical HID element.
High-level fields:
- vid
- pid
- hub path
- interface number
- report id
- usage page
- usage
- collection index
- logical index

### ElementKeyHash
Stable persisted hash of ElementKey.
Usage:
- mapping persistence
- config compilation
- lookup identity across sessions/firmware revisions

### InputElementEvent
Canonical decoded input event.
High-level fields:
- element key hash
- element type
- canonical value
- timestamp

### LogicalGamepadState
Canonical transport-independent controller state.
High-level fields:
- buttons
- axes
- triggers
- hat state

Rules:
- normalized semantics only
- no BLE packing assumptions
- produced only by the mapping layer

### MappingBundle
Immutable active mapping payload.
High-level fields:
- compiled mapping program reference
- program version
- program integrity value (for example CRC)

## Control-Plane Event Shape
Control-plane event shape must support:
- event type
- timestamp
- source/subsystem
- optional device identifier
- optional reason/fault code
- optional metadata payload

Rule:
- control-plane events do not own raw HID report buffers

Expected event categories:
- device connected
- device disconnected
- BLE connected
- BLE disconnected
- config updated
- fault raised
- tick

## Data-Plane Shapes

### RawHidReportRef
High-level fields:
- device identifier
- interface number
- report metadata
- byte-length
- timestamp
- immutable report bytes or immutable buffer reference

Rules:
- bounded lifetime
- no hidden ownership transfer
- suitable for queue/ring handoff

### Decode Plan
High-level contents:
- stable semantic identity mapping
- bit offsets
- field sizes
- signedness
- report id association

Rule:
- generated deterministically from HID semantics

## Port Contracts

### USB Host Port
Must support:
- start
- stop
- interface claim policy hook
- device connected callback
- device disconnected callback
- interrupt IN report delivery callback

Rules:
- core depends on this contract, not ESP-IDF USB APIs
- callbacks enqueue events/report refs rather than doing deep work
- teardown flows through adapter-owned serialized context

### BLE Transport Port
Must support:
- start advertising
- stop advertising
- input report notification
- connected callback
- disconnected callback

Rules:
- profile encoder supplies packed report bytes
- core depends on this contract, not a concrete BLE stack

### Config Store Port
Must support persistence of:
- compiled mapping bundle
- mapping version/integrity metadata
- selected output profile id
- BLE bonding material required by active adapter

Rules:
- core must not assume NVS directly
- persistence identity for mappings is ElementKeyHash-based

### Time Port
Must support:
- monotonic time access for core logic

Used for:
- debounce
- smoothing
- profiling
- heartbeat decisions

Rules:
- no direct platform time dependency in core domain

## Invariants
- Core domain contains no ESP-IDF-specific types
- Persisted mappings never depend on parser-local numbering
- Mapping engine never performs transport-specific packet packing
- Profile encoder never owns USB lifecycle or descriptor parsing
- Supervisor coordinates lifecycle but does not absorb mapping/decoder/packing logic
- Hot-path interfaces must permit bounded deterministic processing
- Configuration activity must remain isolated from run-mode hot-path behavior

## Change Rule
Update this file only when a contract, boundary, shape, or invariant is approved or changed.
