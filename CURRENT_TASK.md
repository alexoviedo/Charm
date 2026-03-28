# CURRENT_TASK.md

## Active Task
- ID: PROD-AUDIT-001
- Title: Final production go/no-go audit (blocked pending closeout packet)
- Status: blocked

## Goal
Maintain production audit hold-state until launch-closeout packet (hardware evidence + approvals) is complete.

## Why this is active now
- `REL-002` completed final audit and handoff documentation with explicit do-not-ship recommendation.
- Remaining open items are evidence/governance closeout tasks outside this completed program slice.

## Entry Facts (must remain true)
- Runtime replacement webapp remains active at `web/`.
- Firmware-side config transport handler is serial-primary contract aligned; BLE config transport remains deferred.
- Automated browser smoke checks exist but cannot prove hardware serial/firmware outcomes.

## Exit Criteria for PROD-AUDIT-001
- Final launch-closeout packet exists: matrix evidence, rollback rehearsal, integrity/provenance verification, and named approvals.
- Explicit ship/no-ship decision recorded with residual-risk acceptance details.
- If approved, production declaration is recorded by authorized sign-off owners.
