# WEB_RELEASES.md

## Source of truth workflow
Runtime web packaging and deployment is handled by:
- `.github/workflows/release.yml`

That workflow performs:
1. ESP-IDF firmware build.
2. Firmware artifact packaging (`manifest.json` + binaries).
3. Integrity/provenance generation (`SHA256SUMS`, `provenance.json`).
4. Web dependency install + Playwright smoke test.
5. Runtime site packaging into:
   - `web/` (active path)
   - `releases/<release_id>/` (rollback snapshot)
6. Pages deployment.

## Runtime artifact layout
Packaged output contains:
- `web/index.html` and runtime assets
- `web/firmware/*` (manifest + binaries)
- `releases/<release_id>/*`
- `deploy-metadata.json`
- `SHA256SUMS`
- `provenance.json`

## Verification commands
```bash
cd <runtime_artifact_dir>
sha256sum -c SHA256SUMS
cat provenance.json
```

## Rollback model
Redeploy a prior known-good commit/release id to restore previous `web/` and `releases/<release_id>/` snapshot.
