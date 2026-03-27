# Webapp Validation Strategy (W-002)

## 1. Purpose
Define the validation strategy for the companion web application to ensure reliability, compatibility, and isolation from the core C++ firmware domain.

## 2. Validation Levels

### W0 — Static Analysis & Linting
- **Scope:** All HTML, CSS, and JavaScript files in `web/`.
- **Criteria:** Code must adhere to standard JS/ES6 formatting without syntax errors. Ensure `esptool-js`, `xterm.js`, `JSZip`, and `crypto-js` are imported securely.

### W1 — Browser Compatibility Checks
- **Scope:** Verify the application correctly identifies Web Serial support.
- **Criteria:**
  - Load the page in Chrome/Edge (Supported). UI should function.
  - Load the page in Firefox/Safari (Unsupported). UI must display the explicit unsupported error message and disable connect/flash actions.

### W2 — Component Unit Testing (Future/Deferred)
- **Scope:** Isolate modules like the firmware fetcher or config compiler.
- **Criteria:** Pure JavaScript functions (like parsing a mapping profile) should have determinable input/output tests. Currently deferred for the MVP until the config compiler is implemented.

### W3 — Integration Validation (Manual)
- **Scope:** The end-to-end user flow.
- **Criteria:**
  - **Fetch:** The app successfully fetches `bootloader.bin`, `partition-table.bin`, and `charm.bin` via static relative URLs over HTTP GET without Authorization headers or CORS errors.
  - **Connect:** The browser's Web Serial dialog opens, port is selected, and `esptool-js` successfully syncs with the ESP32-S3 bootloader stub.
  - **Flash:** Progress callbacks fire accurately, and the `.bin` files are written to `0x0000`, `0x8000`, and `0x10000` without memory exhaustion errors.
  - **Monitor:** After flashing and resetting, the serial monitor correctly displays the ESP-IDF boot log.

### W4 — Error Path Validation
- **Scope:** Simulating failures.
- **Criteria:**
  - Disconnect USB during flash -> Error handled gracefully without unhandled promise rejections.
  - Port already open in another terminal -> `NetworkError` caught and displayed to the user.
  - Missing static `.bin` files on server -> Fetch error caught and displayed to the user.

### Validation Checklist for Future PRs
Before merging any future changes to the `web/` directory, ensure the following checklist is completed:
1. **Lint/Format:** No syntax errors or warnings in HTML/CSS/JS.
2. **Unsupported Browser Test:** Open the app in Firefox/Safari and verify the `browser-support-warning` is visible and actions are disabled.
3. **Supported Browser Test:** Open the app in Chrome/Edge and verify the UI renders correctly.
4. **Firmware Fetch:** Click "Download Latest Firmware" and verify the `manifest.json` info populates without CORS errors.
5. **Port Connection:** Click "Connect Device" and select a port holding the ESP32-S3. Verify the `device-info` populates with the chip and MAC address.
6. **Flash Success:** Click "Flash Firmware", observe the progress updates, and verify the `esptool` completes and resets the device.
7. **Monitor Transition:** Verify the monitor automatically connects after a successful flash.
8. **Independent Monitor:** Disconnect the monitor, reset the UI state, click "Connect Monitor", and verify logs stream in correctly. Check that the "Auto-scroll" and "Clear Output" buttons function as expected.
9. **Error Handling:** Intentionally open the port in a separate terminal program, then try to connect in the web app to verify the "Port is already open" error is caught and displayed cleanly with the recovery guidance panel.
