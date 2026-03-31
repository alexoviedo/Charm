# RELEASE_ROLLBACK.md

## Purpose
Define exact release and rollback operations with provenance checks and safe fallback path.

## Release provenance requirements
A candidate is valid only if artifact bundle contains:
- `SHA256SUMS`
- `provenance.json`
- firmware binaries + `manifest.json` (for firmware bundle)
- packaged web runtime layout (`web/` + `releases/<release_id>/`)

## Release procedure

1. Run automated checks:
```bash
cmake -S tests/unit -B build/unit
cmake --build build/unit --parallel
ctest --test-dir build/unit --output-on-failure
npm --prefix web ci
npx --prefix web playwright install --with-deps chromium
npm --prefix web run qa:smoke
```

2. Verify firmware artifact integrity:
```bash
cd <firmware_artifact_dir>
sha256sum -c SHA256SUMS
cat provenance.json
```

3. Verify web artifact integrity:
```bash
cd <web_artifact_dir>
sha256sum -c SHA256SUMS
cat provenance.json
```

4. Execute mandatory hardware scenarios from `HARDWARE_VALIDATION_PACK.md`.

5. Record release packet:
- commit SHA(s)
- release id
- workflow run ids
- evidence directory links
- explicit go/no-go sign-off

## Flashing procedure (operator)
1. Open web runtime.
2. Request serial permission.
3. Claim owner `Flash`.
4. Load artifacts (same-site or local import).
5. Identify device.
6. Flash firmware bundle.
7. Confirm success status and reboot logs.

## Rollback procedure

### Web rollback
1. Select prior known-good release id / commit.
2. Redeploy that release snapshot.
3. Re-run web smoke tests + minimal manual sanity checks.

### Firmware rollback
1. Retrieve prior known-good firmware artifact set.
2. Verify checksums + provenance.
3. Flash rollback bundle using normal flash path.
4. Verify monitor/config baseline behavior.

## Known-safe fallback path
If candidate is unstable:
- Revert to previous known-good firmware artifacts and web release id.
- Disable promotion of current candidate.
- Open blocker with scenario ids and evidence links.

## Recovery procedures
- Flash failures: release owner, reset permission model, reconnect device, retry identify + flash.
- Config transport failures: ensure `Flash` ownership + monitor disconnected, retry get_capabilities first.
- BLE instability: collect logs + run BLE reconnect scenario before retrying promotion.
