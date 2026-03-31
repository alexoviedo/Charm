# OPERATIONS_RUNBOOKS.md

## Scope
Operational procedures for release, deploy verification, rollback, and incident triage.

## Release operations
- Workflow: `.github/workflows/release.yml`
- Scripts:
  - `scripts/package_web_runtime.sh`
  - `scripts/generate_release_integrity.sh`

### Required release checks
1. Firmware build success.
2. Web smoke checks pass.
3. `SHA256SUMS` verification passes for firmware and runtime web artifacts.
4. `provenance.json` includes commit/run metadata.
5. Hardware scenarios executed per `HARDWARE_VALIDATION_PACK.md` before production recommendation.

## Deployment verification checklist
- Page loads and shows panels: Flash / Console / Config / Validate.
- Capability banner matches environment.
- Config controls are visible and ownership guardrails are enforced.
- Flash flow can enter identify/flash path when prerequisites are met.

## Rollback quick procedure
1. Identify known-good commit/release id.
2. Redeploy that snapshot.
3. Verify integrity and basic runtime behavior.
4. Record evidence in `evidence/<date>/rollback/`.

## Incident triage
- Flash blocked/failure: confirm permission + `Flash` owner + monitor disconnected.
- Config failures: run `config.get_capabilities` first, then load/persist/clear.
- BLE instability: collect logs during connect/disconnect/recovery scenario.

## Severity guidance
- P0: flash/config/release integrity broken.
- P1: degraded core function with workaround.
- P2: non-critical UX/docs issue.
