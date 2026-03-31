# CONFIG_TRANSPORT_CONTRACT.md

## Purpose
Define the production serial-first host/device config transport contract and framing used by live firmware/web runtime integration.

## Status
- Contract version: `v1`
- Runtime status: implemented in firmware parser/runtime adapter + web config transport client

## Chosen First Transport Path
1. **First transport path:** Web Serial request/response command channel over the existing browser-to-device serial link.
2. **Serial primary?:** Yes. Serial is the only primary transport for first production config write/persist.
3. **BLE config transport:** Deferred (optional future path only after separate proof/contract slice).

## Contract Model (Request/Response/Error)

### Command Set (v1)
- `config.persist`
- `config.load`
- `config.clear`
- `config.get_capabilities`

### Request Shape (logical contract)
- `protocol_version` (required)
- `request_id` (required, unique per in-flight request)
- `command` (required; one of command set above)
- `payload` (command-specific)
- `integrity` (required metadata for validation)

### Wire Framing (production serial-safe)
- **Frame prefix:** `@CFG:`
- **Wire request format:** `@CFG:{json}\n`
- **Wire response format:** `@CFG:{json}\n`
- Frames without `@CFG:` prefix are ignored by firmware config runtime transport so human-readable logs can coexist on the same serial stream without contaminating config parsing.
- Web client must only parse response lines that start with `@CFG:`.

### Response Shape (logical contract payload after `@CFG:` prefix)
- `protocol_version` (required)
- `request_id` (required; must match request)
- `status` (required; maps to firmware `ContractStatus`)
- `fault` (optional; required when status is non-ok; maps to firmware `FaultCode`)
- `payload` (command-specific output)

### Error Mapping (lossless)
- Transport framing/IO faults remain transport-level errors and must not be rewritten as firmware-domain success.
- Firmware returns must preserve contract semantics:
  - `kOk`
  - `kRejected`
  - `kUnavailable`
  - `kFailed`
- Fault mapping must preserve category + reason without collapsing categories.

## Persistence Expectations
- `config.persist` writes mapping bundle/profile payload to firmware config store boundary only.
- Persisted write is explicit (no implicit persist on load/clear).
- `config.load` is read-only and returns current persisted view.
- `config.clear` removes persisted config and returns explicit status/fault.
- Bonding material in first path is **optional payload field** and may be absent.

## Versioning + Integrity Expectations
- Contract versioning is explicit via `protocol_version` and must be validated before command execution.
- Message integrity metadata is required in request/response envelopes for verification.
- Unsupported versions must fail closed with explicit non-ok status/fault and no state mutation.

## Failure + Rollback Behavior
- Fail closed on malformed envelope, unsupported version, or integrity mismatch.
- If persist fails, previous persisted configuration remains authoritative (no partial commit claim).
- No speculative/optimistic web success: UI must wait for explicit firmware response status.

## Webapp Needs From Firmware
- Deterministic request/response behavior for `persist/load/clear/get_capabilities`.
- Stable status/fault mapping aligned to existing firmware contracts.
- Capability response that indicates supported protocol version and command set.
- Robust coexistence with boot/runtime logs over the same serial channel via explicit frame prefix filtering.

## Explicit Non-Support in First Config-Transport Slice
- No BLE config transport in first production path.
- No multi-transport negotiation/racing.
- No streaming/partial config upload semantics.
- No background auto-retry persist loops hidden from UI.
- No schema migration/version-upgrade logic beyond strict version acceptance/rejection.

## Dependency Guardrails
- Keep config transport contract anchored to existing repo contracts (`PersistConfig*`, `LoadConfig*`, `ClearConfig*`, `FaultCode`, `ContractStatus`).
- Do not enable runtime config write/persist until `CFG-002` protocol specification is approved.
