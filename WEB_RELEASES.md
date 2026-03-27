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
4. **Deploy Step (Future):** A GitHub Pages deployment step uploads the `web/` folder and the generated `firmware/` folder as a single static site artifact.

## 4. Why This Approach?
- **Zero Credentials:** The web app issues a simple `GET /firmware/manifest.json`. No GitHub PATs or API authentication are required.
- **Atomic Releases:** The web app and its corresponding firmware binaries are deployed as a single, consistent unit.
- **Simple Extensibility:** If multiple channels (stable/beta) or targets are needed later, the manifest can be extended to an array without rewriting the JS fetching logic heavily.
