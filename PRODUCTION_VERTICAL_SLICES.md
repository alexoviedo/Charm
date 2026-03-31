# PRODUCTION_VERTICAL_SLICES.md

## Program status
- Prior slices (runtime, config transport, BLE hardening, startup lifecycle, test portability, web consolidation) are implemented in code.
- Current active slice: **VS-08 final closeout truth + validation/release evidence completion**.

## Slice truth table

| Slice | Status | Evidence source |
|---|---|---|
| VS-01 Runtime data plane integration | Implemented + unit-tested | `tests/unit/test_runtime_data_plane.cpp` |
| VS-02 Config transport adapter | Implemented + unit-tested | `tests/unit/test_config_transport_runtime_adapter.cpp` |
| VS-03 BLE callback/recovery hardening | Implemented + unit-tested | `tests/unit/test_ble_transport_adapter.cpp` |
| VS-04 Startup storage lifecycle | Implemented + unit-tested | `tests/unit/test_startup_storage_lifecycle.cpp` |
| VS-05 Test bootstrap portability | Implemented | `tests/unit/CMakeLists.txt` FetchContent fallback |
| VS-06 Web runtime consolidation | Implemented | Canonical runtime under `web/` |
| VS-07 Hardware validation pack definition | Implemented as artifact | `HARDWARE_VALIDATION_PACK.md` |
| VS-08 Final gate closure | In progress | Requires completed hardware evidence + sign-off |

## Remaining required work to close program
1. Execute hardware matrix and capture evidence.
2. Run release + rollback rehearsal with evidence.
3. Produce signed go/no-go packet.
