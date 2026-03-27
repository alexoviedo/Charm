# CURRENT_TASK.md

## Active Task
- ID: WR-015
- Title: Config transport proof plan
- Status: blocked

## Goal
Define the evidence and acceptance criteria required to prove host/device config transport before runtime config write/persist implementation.

## Context from Prior Slice
- WR-009 hardened flash/console separation with explicit handoff states, failure recovery UX, reconnect/retry guidance, and stale-state cleanup on permission/transport errors.
- WR-010 delivered local draft config IA coverage for mappings/axes/buttons/scaling/clamping/deadzones/inversion, metadata, and validation/error slots in `web-next/`.
- WR-011 delivered deterministic local validation, JSON import/export round-trip, and optional browser-local draft save/load with explicit non-device labeling.
- WR-012 assessment found no repo-proven serial config protocol and no repo-proven non-HID BLE config path.
- WR-013 delivered browser-side validation dashboard and Gamepad API tester with no-controller troubleshooting and live button/axis readouts.
- WR-014 completed runtime cutover: validated replacement implementation is now active under `web/` and legacy runtime implementation is retired.
- Device write/persist remains blocked in runtime UI as `blocked_unproven_transport`.
