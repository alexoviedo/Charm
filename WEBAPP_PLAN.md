# Webapp Product Contract and Architecture Plan (W-002)

## 1. Product Objective
Create a standalone, high-quality companion web application for the Charm ESP32-S3 firmware project. The web app must be hosted as a pure static site without backend dependencies, cloud infrastructure, or user accounts. It relies entirely on browser-native APIs (Web Serial) for device communication.

## 2. MVP Capabilities
- **Firmware Flash:** Download static firmware artifacts hosted alongside the webapp and flash them to a connected ESP32-S3 using Web Serial and `esptool-js`.
- **Serial/Debug Monitor:** Provide a real-time, in-browser serial monitor for the connected device using Web Serial and `xterm.js`, with manual connect/disconnect and auto-scrolling capabilities.
- **Device/Build Info Visibility:** Display the target device chip type, MAC address, target firmware version, build date, and provide clear recovery/retry guidance for flashing failures.

## 3. Non-Goals for MVP
- **Cloud Sync:** No synchronization of settings or profiles to cloud storage.
- **User Accounts:** No login, registration, or authentication requirements.
- **Server-Backed Profile Storage:** No backend database or persistence layer for user mapping profiles.
- **Remote Fleet Management:** No remote monitoring, updates, or management of multiple devices simultaneously over a network.
- **Dynamic CI Artifact Fetching:** The web app will not query the GitHub Actions REST API dynamically using PATs or public endpoints, preventing rate limits and credential leakage.

## 4. Browser Support Policy
- Supported: Modern browsers implementing the Web Serial API (e.g., Google Chrome 89+, Microsoft Edge 89+, Opera 76+).
- Unsupported: Firefox, Safari, and any mobile browser lacking Web Serial support.

## 5. Unsupported-Browser Behavior
- If `navigator.serial` is undefined, the application must:
  1. Display a clear, prominent, and friendly error message immediately upon load.
  2. Disable all connection and flashing interactive elements.
  3. Direct the user to use a supported browser (Chrome, Edge).

## 6. Release Artifact Expectations from CI/CD
- The CI/CD pipeline is entirely responsible for preparing and placing the required binaries.
- The web app expects a statically hosted directory (e.g., `firmware/`) alongside its deployment.
- Expected static artifacts within this directory:
  - `bootloader.bin`
  - `partition-table.bin`
  - `charm.bin` (main application)
- The web app fetches these via relative HTTP GET requests (e.g., `fetch('./firmware/charm.bin')`).

## 7. Later-Phase Expectations
- **Profile/Config Workflow:** A separate UI module will be introduced later to construct JSON mapping configurations. The web app will compile these configurations into the canonical `MappingBundle` binary format using a JS-ported compiler, and flash them to the ESP32-S3's NVS partition via Web Serial without needing a C++ toolchain.
