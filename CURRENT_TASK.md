# CURRENT_TASK.md

## Active Task
- ID: CT-018
- Title: S-017 — Platform time adapter implementation
- Status: done

## Goal
Implement only the platform monotonic time adapter behind the time port.

## In Scope
- Create `TimePortEspIdf` in `time_port_esp_idf.cpp`.
- Implement ESP-IDF `esp_timer_get_time` call to fulfill `TimePort` contract.
- Component structural files (`CMakeLists.txt`, `time_port_esp_idf.hpp`).

## Out Of Scope
- Implementing other adapters (USB, BLE, Config Store).
- App wiring.

## Assumptions
- Tests run purely natively, meaning ESP-IDF mocking is needed for native validation.

## Dependencies
- S-003

## Touched Files
- `components/charm_platform_time/CMakeLists.txt`
- `components/charm_platform_time/include/charm/platform/time_port_esp_idf.hpp`
- `components/charm_platform_time/src/time_port_esp_idf.cpp`
- `components/charm_test_support/include/esp_timer.h`
- `components/charm_test_support/src/esp_timer_mock.cpp`
- `tests/unit/CMakeLists.txt`
- `CURRENT_TASK.md`
- `TODO.md`
- `IMPLEMENTATION_SLICES.md`
- `CHANGELOG_AI.md`

## Risks
- Microsecond timing might wrap or need correct scaling in the core logic later, but `Timestamp` uses ticks so we pass it directly per contract.

## Validation Plan
- V3 compile/integration validation for the adapter component via the native test runner.

## Rollback Plan
- Revert S-017 PR.

## Acceptance Gates
- Adapter satisfies the approved time port only.
- No other platform services are introduced.
- No core contracts are modified.

## Stop Condition
Stop after S-017 is implemented and submitted as a PR against `main`.
