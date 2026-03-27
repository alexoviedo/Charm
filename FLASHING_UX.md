# Flashing UX and Permission Model (W-002)

## 1. Overview
This document defines the user experience, browser permission flow, and error handling model for the Web Serial firmware flasher.

## 2. Permission Model
- **Explicit User Action:** Browsers strictly require Web Serial port requests (`navigator.serial.requestPort()`) to occur within a synchronous user-initiated event (like a button `click`).
- **No Background Access:** The web application cannot connect to a device on load or in the background. The user must manually grant permission for the specific session.
- **Port Persistence:** While browsers may remember previously granted ports, the app must not assume it has access. It should always offer a clear "Connect" action that re-verifies or requests the port.

## 3. Flashing User Experience (MVP)

### Step 1: Pre-Connection State
- **UI:** A simple screen showing the current available static firmware version (fetched via manifest).
- **Action:** A "Connect & Flash" (or separate "Connect" then "Flash") button is present but clearly states the requirement to connect the ESP32-S3 via USB.
- **Feedback:** "Waiting for device connection..."

### Step 2: The Connection Flow
- **Action:** User clicks "Connect".
- **Browser UI:** The native browser Web Serial dialog appears, asking the user to select the COM/tty port representing the ESP32-S3.
- **Feedback:**
  - If rejected/cancelled: Display "Connection cancelled by user."
  - If successful: Transition to the active state, showing "Connected to ESP32-S3 on Port X."

### Step 3: The Flashing Flow
- **Action:** User clicks "Flash Firmware".
- **Process:**
  - `esptool-js` takes over the transport.
  - The UI must display a clear, deterministic progress bar or percentage indicator driven by `esptool-js`'s `reportProgress` callback.
  - The serial monitor should be disabled or paused during the flash to prevent resource contention on the transport.
- **Feedback:**
  - "Erasing flash..."
  - "Writing bootloader (xx%)..."
  - "Writing partition table (xx%)..."
  - "Writing app (xx%)..."

### Step 4: Post-Flash / Reboot
- **Process:** Once flashing completes, the app issues a hard reset command.
- **Feedback:** "Flash successful! Rebooting device..."
- **Transition:** The UI automatically switches focus to the Serial Monitor to show the device booting.

## 4. Error Handling & Recovery

### Connection Errors
- **Port Already in Use:** If another tab, terminal, or app holds the port, Web Serial throws a `NetworkError`.
  - **UX Response:** Display "Port is already in use by another application. Please close other serial monitors and try again."

### Flashing Errors
- **Device Disconnected Mid-Flash:** If the USB cable is unplugged.
  - **UX Response:** Catch the transport error, halt the progress bar, and display: "Device disconnected. Please reconnect and try flashing again."
- **Sync/Bootloader Errors:** If `esptool-js` fails to sync with the stub.
  - **UX Response:** "Failed to communicate with device bootloader. Please hold the BOOT button, press EN, release EN, then release BOOT to enter download mode manually, and try again."

### Data Errors
- **Missing Artifacts:** If the static `firmware/` directory is missing a required `.bin` file.
  - **UX Response:** Display "Firmware artifacts are incomplete or missing on the server. Please check the deployment." and disable flashing.
