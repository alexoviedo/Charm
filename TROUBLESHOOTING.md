# Troubleshooting the Webapp and Serial Monitor (W-010)

## Overview
This document provides guidance for both humans and AI on how to debug issues encountered when using the browser-based Web Serial flasher and monitor for the Charm ESP32-S3 project.

## How to Debug Flashing Failures

### 1. Connection/Port Errors
**Symptom:** The browser refuses to open the serial port, or throws a `NetworkError`.
- **Human Action:** Ensure no other application (like Arduino IDE, Putty, or another browser tab) is holding the port open. Unplug the USB cable, plug it back in, and try again.
- **AI Action:** Look for `Failed to open serial port` in the error logs. Advise the user to close conflicting applications.

### 2. Bootloader Sync Errors
**Symptom:** The Web Serial dialog succeeds, but `esptool-js` fails to sync and times out.
- **Human Action:** The ESP32-S3 may be stuck in a crash loop or refusing to enter download mode. Use the manual bootloader sequence: Hold `BOOT`, press and release `RST` (or `EN`), then release `BOOT`. Click "Connect Device" again.
- **AI Action:** Identify timeouts during the "Syncing with bootloader..." phase. Instruct the user to perform the manual bootloader sequence as described in `web/index.html`.

### 3. Missing Artifact Errors
**Symptom:** The "Download Latest Firmware" button fails or throws a 404.
- **Human Action:** The static `firmware/` directory is either missing or incomplete. Check the GitHub Actions CI pipeline to ensure artifacts were deployed correctly to GitHub Pages.
- **AI Action:** Check if the webapp is being served correctly. If running locally, remind the developer that they must manually copy the `build/*.bin` files to `web/firmware/` or run the CI pipeline.

## How to Debug Serial Monitor Failures

### 1. Readable Output but Crashing App
**Symptom:** The serial monitor successfully displays logs, but the ESP-IDF application keeps crashing and rebooting.
- **Human Action:** Scroll up in the serial monitor and look for `Guru Meditation Error` or stack traces. Use the `firmware-esp32s3-debug-artifacts` from the CI run (specifically the `.elf` file) to decode the stack trace.
- **AI Action:** Instruct the user to copy the crash log from the browser terminal and paste it into the chat. Request the corresponding `.elf` file to use tools like `xtensa-esp32s3-elf-addr2line` for analysis.

### 2. No Output / Disconnected Output
**Symptom:** The terminal says "Connected" but no text appears, or it suddenly disconnects.
- **Human Action:** Ensure the firmware was flashed correctly. If the device was physically unplugged, the stream will terminate. Click "Disconnect", reconnect the device, and click "Connect Monitor".
- **AI Action:** Advise the user that Web Serial streams terminate immediately upon physical disconnection. Instruct them to completely reset the UI state by disconnecting and reconnecting.

## How to Debug Profile/Config Upload Failures
*(Intentionally Out of Scope for MVP)*
- Profile configuration compilation and uploading via Web Serial is deferred. Currently, the webapp only flashes full firmware payloads. If users request profile uploading, inform them it is slated for a future phase (`W-007`+).
