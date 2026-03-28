# Web Releases and Artifact Structure (W-003)

## 1. Overview
This document defines how firmware artifacts are built by the CI pipeline, formatted, and exposed to the static web application for in-browser flashing.

## 2. Release Artifact Expectations
The continuous integration pipeline (`firmware_build.yml`) is the sole source of truth for generating deployable artifacts. The web app expects a static folder containing the raw `.bin` files needed by `esptool-js`.

### Expected Directory Layout
When the web app is deployed (e.g., to GitHub Pages), it expects a directory named `firmware/` relative to `index.html`.

```
/index.html
/style.css
/src/main.js
/src/firmware.js
/src/flasher.js
/src/monitor.js
/firmware/
  ├── manifest.json
  ├── bootloader.bin
  ├── partition-table.bin
  └── charm.bin
```

### The Manifest File
To avoid hardcoding versions in the frontend, the CI pipeline must generate a `manifest.json` file inside the `firmware/` folder during the build.

**Example `manifest.json`:**
```json
{
  "version": "latest",
  "build_time": "2023-10-27T10:00:00Z",
  "commit_sha": "abc123def456",
  "target": "esp32s3",
  "files": {
    "bootloader": "bootloader.bin",
    "partition_table": "partition-table.bin",
    "app": "charm.bin"
  }
}
```

## 3. Web Delivery Pipeline
1. **Build Step:** CI compiles the ESP-IDF project for target `esp32s3`.
2. **Package Step:** A script creates the `firmware/` directory, copies `build/bootloader/bootloader.bin`, `build/partition_table/partition-table.bin`, and `build/charm.bin` into it.
3. **Manifest Step:** The script generates `manifest.json` with the current commit SHA and timestamp.
4. **Deploy Step:** Runtime web deployment is handled by `.github/workflows/web_runtime_deploy.yml`, which packages `web/` into:
   - `current/` (active runtime path)
   - `releases/<release_id>/` (rollback-aware release snapshot)
   - `deploy-metadata.json` (release/run traceability)

## 3.1 Deployment Workflow Separation
- `firmware_build.yml` continues to build firmware binaries and publish firmware artifacts.
- `web_runtime_deploy.yml` deploys runtime web assets only.
- Runtime deploy packaging is gated by Playwright smoke checks (`npm --prefix web run qa:smoke`) before deployment artifact upload.
- This separation preserves firmware build behavior while allowing controlled web runtime promotion (`staging`/`production`) on GitHub Pages.

## 3.2 Rollback Model
- Each deployment includes a versioned release snapshot under `releases/<release_id>/`.
- Rollback can be performed by rerunning deployment from a prior commit/release id to restore a known-good `current/` path.

## 3.3 Integrity + Provenance Outputs
- Firmware and runtime-web packaging flows both generate:
  - `SHA256SUMS` (artifact checksums)
  - `provenance.json` (commit/run/workflow metadata)

Operator verification examples:
```bash
cd <artifact_dir>
sha256sum -c SHA256SUMS
cat provenance.json
```

Expected minimum provenance fields:
- `artifact_name`
- `commit_sha`
- `workflow`
- `run_id`
- `generated_at`

## 4. Why This Approach?
- **Zero Credentials:** The web app issues a simple `GET /firmware/manifest.json`. No GitHub PATs or API authentication are required.
- **Atomic Releases:** The web app and its corresponding firmware binaries are deployed as a single, consistent unit.
- **Simple Extensibility:** If multiple channels (stable/beta) or targets are needed later, the manifest can be extended to an array without rewriting the JS fetching logic heavily.


## 3.4 Operations Runbooks
- Production runbooks for release/deploy verification/rollback/recovery/escalation are maintained in `OPERATIONS_RUNBOOKS.md`.
- Manual hardware acceptance execution/evidence schema is maintained in `MANUAL_ACCEPTANCE_MATRIX.md`.
- Operators should treat these as required companions to this artifact-structure reference during gate reviews.
