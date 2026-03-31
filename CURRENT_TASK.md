# CURRENT_TASK.md

## Active Task
- ID: AUTH-HOLD-001
- Title: Final Post-Program Audit / Authorization Hold
- Status: in_progress

## Goal
Maintain an authorization hold while running final post-program audit actions against the completed VS-08 closure package until pending evidence and sign-offs are resolved.

## Why this is active now
- VS-08 closure package was completed and records a blocked/do-not-ship posture pending hardware evidence, rollback rehearsal execution, and approvals.
- AUTH-HOLD-001 final audit record (`AUTH_HOLD_001_FINAL_AUDIT.md`) confirms hold remains retained until closeout items are evidenced.

## Entry Facts (must remain true)
- Runtime replacement webapp remains active at `web/`.
- Canonical runtime web path is `web/`; non-canonical `web-next/` has been removed.
- Firmware serial-first config transport runtime boundary now exists; BLE config transport remains deferred.
- Previous PROD/FW/CFG/WEB/CI/QA/OPS/REL program history is preserved as historical record.

## Exit Criteria for AUTH-HOLD-001
- All pending VS-08 closure conditions are satisfied and evidenced, or an explicit no-ship decision is ratified.
- Sign-off matrix is complete and auditable.
- Final authorization record is published with accountable approvers.
