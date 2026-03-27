// src/main.js
import { FirmwareService } from './firmware.js';
import { SerialMonitor } from './monitor.js';
import { WebFlasher } from './flasher.js';

document.addEventListener("DOMContentLoaded", () => {
  const fetchStatus = document.getElementById("fetch-status");
  const flashStatus = document.getElementById("flash-status");
  const monitorStatus = document.getElementById("monitor-status");

  const fetchBtn = document.getElementById("fetch-btn");
  const connectBtn = document.getElementById("connect-btn");
  const flashBtn = document.getElementById("flash-btn");
  const monitorConnectBtn = document.getElementById("monitor-connect-btn");
  const monitorDisconnectBtn = document.getElementById("monitor-disconnect-btn");
  const clearMonitorBtn = document.getElementById("clear-monitor-btn");
  const autoScrollCb = document.getElementById("auto-scroll-cb");

  const browserWarning = document.getElementById("browser-support-warning");
  const appContent = document.getElementById("app-content");

  // Info containers
  const fwInfoBox = document.getElementById("firmware-info");
  const devInfoBox = document.getElementById("device-info");
  const recoveryBox = document.getElementById("recovery-guidance");

  // Ensure Web Serial API is supported
  if (!navigator.serial) {
    if (browserWarning) browserWarning.style.display = 'block';
    if (appContent) appContent.style.opacity = '0.5';
    fetchBtn.disabled = true;
    connectBtn.disabled = true;
    flashBtn.disabled = true;
    monitorConnectBtn.disabled = true;
    return;
  }

  const monitor = new SerialMonitor("terminal-container", monitorStatus, autoScrollCb);
  const firmware = new FirmwareService(fetchStatus);
  const flasher = new WebFlasher(flashStatus, monitor.term);

  let binaries = null;

  // Set up Flasher callbacks for UI updates
  flasher.onDeviceInfo = (info) => {
    devInfoBox.style.display = 'block';
    document.getElementById("info-chip").textContent = info.chip;
    document.getElementById("info-mac").textContent = info.mac;
    recoveryBox.style.display = 'none'; // hide recovery on successful sync
  };

  flasher.onError = (msg) => {
    recoveryBox.style.display = 'block';
  };

  // Bind Fetch Action
  fetchBtn.addEventListener("click", async () => {
    fetchBtn.disabled = true;

    try {
        // Fetch manifest first to show info
        const manifestRes = await fetch('./firmware/manifest.json');
        if (manifestRes.ok) {
            const manifest = await manifestRes.json();
            fwInfoBox.style.display = 'block';
            document.getElementById("info-target").textContent = manifest.target || 'esp32s3';
            document.getElementById("info-version").textContent = manifest.version || 'latest';
            document.getElementById("info-date").textContent = manifest.build_time || 'unknown';
        }
    } catch (e) {
        console.warn("Could not pre-fetch manifest info:", e);
    }

    binaries = await firmware.fetchArtifacts();

    if (binaries) {
      connectBtn.disabled = false;
    }
    fetchBtn.disabled = false;
  });

  // Bind Connect Action
  connectBtn.addEventListener("click", async () => {
    // Ensure monitor isn't holding the port
    await monitor.disconnect();

    const success = await flasher.connect();
    if (success) {
      connectBtn.disabled = true;
      flashBtn.disabled = false;
      monitorConnectBtn.disabled = true; // disable independent monitor connection while preparing to flash
    }
  });

  // Bind Flash Action
  flashBtn.addEventListener("click", async () => {
    flashBtn.disabled = true;
    const flashedDevice = await flasher.flash(binaries);

    if (flashedDevice) {
        // Flash succeeded. Auto-connect monitor.
        connectBtn.disabled = false;
        monitorConnectBtn.disabled = true;
        monitorDisconnectBtn.disabled = false;
        await monitor.connect(flashedDevice);
    } else {
        // Flash failed
        connectBtn.disabled = false;
        monitorConnectBtn.disabled = false;
    }
  });

  // Bind Monitor Actions
  monitorConnectBtn.addEventListener("click", async () => {
    monitorConnectBtn.disabled = true;
    const success = await monitor.connect();
    if (success) {
        monitorDisconnectBtn.disabled = false;
    } else {
        monitorConnectBtn.disabled = false;
    }
  });

  monitorDisconnectBtn.addEventListener("click", async () => {
    monitorDisconnectBtn.disabled = true;
    await monitor.disconnect();
    monitorConnectBtn.disabled = false;
  });

  clearMonitorBtn.addEventListener("click", () => {
    monitor.clear();
  });
});
